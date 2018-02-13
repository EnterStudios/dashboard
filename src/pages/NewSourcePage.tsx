import * as React from "react";
import { connect } from "react-redux";
import { push, RouterAction } from "react-router-redux";

import { createSourceSuccess, CreateSourceSuccess } from "../actions/source";
import Button from "../components/Button";
import { Cell, Grid } from "../components/Grid";
import { NameRule, SourceForm } from "../components/SourceForm";
import Source from "../models/source";
import { IntegrationPage } from "../pages/integration";
import { State } from "../reducers";
import service from "../services/source";

/**
 * Validator class for the SourceForm.  Exported for direct testing.
 */
export class SourceNameRule implements NameRule {
    regex: RegExp = /^[a-zA-Z0-9-][a-zA-Z0-9- ]+[a-zA-Z0-9-]$/;
    errorMessage = (input: string): string => {
        return "The name must have three letters and contain no special characters except hyphen.";
    }
}

interface NewSourceProps {
    newSource: (source: Source) => CreateSourceSuccess;
    goToLogs: (source: Source) => RouterAction;
    goToSettings: (source: Source) => RouterAction;
    sources: Source[];
}

interface NewSourceState {
    source: Source | undefined;
    error: Error | undefined;
};

function mapStateToProps(state: State.All) {
    return {
        sources: state.source.sources
    };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>) {
    return {
        newSource: function (source: Source): CreateSourceSuccess {
            return dispatch(createSourceSuccess(source));
        },

        goToLogs: function (source: Source): RouterAction {
            return dispatch(push("/skills/" + source.id));
        },

        goToSettings: function (source: Source): RouterAction {
            return dispatch(push("/skills/" + source.id + "/settings"));
        }
    };
}

export class NewSourcePage extends React.Component<NewSourceProps, NewSourceState> {

    constructor(props: NewSourceProps) {
        super(props);
        this.createSource = this.createSource.bind(this);
        this.goToLogs = this.goToLogs.bind(this);
        this.goToSettings = this.goToSettings.bind(this);
        this.goBack = this.goBack.bind(this);

        this.state = {
            source: undefined,
            error: undefined
        };
    }

    createSource(source: Source) {
        return service.createSource(source)
            .then((newSource: Source) => {
                this.props.newSource(newSource);
                this.setState({
                    source: newSource,
                    error: undefined
                });
            }).catch((err: Error) => {
                this.setState({
                    source: undefined,
                    error: new Error("Unable to create source at this time.")
                });
            });
    }

    goToLogs() {
        this.props.goToLogs(this.state.source);
    }

    goToSettings() {
        this.props.goToSettings(this.state.source);
    }

    goBack() {
        this.setState({
            source: undefined,
            error: undefined
        });
    }

    render() {
        let createSource = this.state.source === undefined;

        let header = (this.props.sources.length === 0) ? (
            <Grid>
                <Cell col={12}>
                    <h5>Enter the name of your data source and then click Create Source.</h5>
                    <h5>Then, to start sending logs, follow the instructions on how to integrate the SDK into your skill, action or app.</h5>
                </Cell>
            </Grid>
        ) : (<div />);

        let bottomHalf = (createSource) ?
            (<NewSkillForm onCreateSource={this.createSource} error={this.state.error} />) :
            (<CodeForm source={this.state.source} onGoToLogs={this.goToLogs} onGoToSettings={this.goToSettings} onGoBack={this.goBack} />);

        return (
            <div>
                {header}
                {bottomHalf}
            </div>
        );
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewSourcePage);

interface NewSkillProps {
    onCreateSource: (source: Source) => void;
    error?: Error;
}

class NewSkillForm extends React.Component<NewSkillProps, any> {

    render(): JSX.Element {
        return (
            <Grid>
                <Cell col={12}>
                    <h4>New Source Setup</h4>
                </Cell>
                <Cell col={12}>
                    <ul style={{fontSize: "1.3em", margin: "0 0 20px", padding: "0 20px"}}>
                        <li>A source can be an Alexa Skill or Action on Google.
                            <ul>
                                <li style={{fontSize: "1.3em", lineHeight: "1.8em", fontStyle: "italic"}}>Or any other app that you would like to send events from via our SDK</li>
                            </ul>
                        </li>
                        <li>By setting up your source, you can begin using Bespoken's Logging and Monitoring features.</li>
                    </ul>
                    <p style={{fontSize: ".9em"}}>Currently all data sources must be at least three characters in length and not contain any special characters.</p>
                </Cell>
                <Cell col={12}>
                    <SourceForm
                        createSource={this.props.onCreateSource}
                        error={this.props.error}
                        nameRule={new SourceNameRule()} />
                </Cell>
            </Grid>
        );
    }
}

interface CodeFormProps {
    source: Source | undefined;
    onGoToLogs: (source: Source) => void;
    onGoToSettings: (source: Source) => void;
    onGoBack: () => void;
}

interface CodeFormState {
}

class CodeForm extends React.Component<CodeFormProps, CodeFormState> {

    constructor(props: CodeFormProps) {
        super(props);

        this.goToLogs = this.goToLogs.bind(this);

        this.state = {
        };
    }

    goToLogs() {
        this.props.onGoToLogs(this.props.source);
    }

    render(): JSX.Element {
        const hasKey = this.props.source !== undefined;
        const { onGoBack, source } = this.props;
        return (
            <div>
                <IntegrationPage showSecret={true} source={source} />
                {
                    (hasKey) ?
                        (
                            <Grid>
                                <Cell col={12}>
                                    <Button accent={true} raised={true} onClick={this.goToLogs}>Continue</Button>
                                </Cell>
                                <Cell col={12}>
                                    <Button raised={true} onClick={onGoBack}>Create Another</Button>
                                </Cell>
                            </Grid>
                        )
                        : (<div />)
                }
            </div>
        );
    }
}
