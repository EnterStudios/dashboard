import * as moment from "moment";
import * as React from "react";
import { connect } from "react-redux";
import { replace, RouterAction } from "react-router-redux";

import { deleteSource } from "../../actions/source";
import Source from "../../models/source";
import { State } from "../../reducers";

import SourceFullSummary from "./SourceFullSummary";
import SourceHeader from "./SourceHeader";

interface SourcePageProps {
    source: Source;
    goHome: () => RouterAction;
    removeSource: (source: Source) => Promise<Source>;
}

interface SourcePageState {
    deleteDialogActive: boolean;
}

function mapStateToProps(state: State.All) {
    return {
        source: state.source.currentSource
    };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>) {
    return {
        goHome: function (): RouterAction {
            return dispatch(replace("/skills"));
        },
        removeSource: function (source: Source): Promise<Source> {
            return dispatch(deleteSource(source));
        }
    };
}

export class SourcePage extends React.Component<SourcePageProps, SourcePageState> {

    dialogActions: any[];

    constructor(props: SourcePageProps) {
        super(props);
        this.handleDeleteDialogToggle = this.handleDeleteDialogToggle.bind(this);
        this.handleDeleteSkill = this.handleDeleteSkill.bind(this);

        this.dialogActions = [{
            label: "Cancel",
            onClick: this.handleDeleteDialogToggle
        }, {
            label: "Delete",
            onClick: this.handleDeleteSkill
        }];

        this.state = {
            deleteDialogActive: false,
        };
    }

    handleDeleteDialogToggle() {
        this.state.deleteDialogActive = !this.state.deleteDialogActive;
        this.setState(this.state);
    }

    handleDeleteSkill(): Promise<Source> {
        const goBack = this.props.goHome;
        const source = this.props.source;
        return this.props.removeSource(source)
            .then(function (source: Source) {
                goBack();
                return source;
            }).catch(function (e: Error) {
                console.error(e);
                return source;
            });
    }

    render() {
        const { source } = this.props;
        const start = moment().subtract(7, "days");
        const end = moment();
        if (!source) {
            return (<div />);
        }
        return (
            <span>
                <span>
                    <SourceHeader
                        source={source} />
                </span>
                <SourceFullSummary
                    header={"Last Seven Day Summary"}
                    source={source}
                    startDate={start}
                    endDate={end} />
            </span>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SourcePage);
