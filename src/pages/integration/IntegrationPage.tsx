import * as React from "react";

import {Tab, Tabs} from "react-toolbox";
import {Cell, Grid} from "../../components/Grid";

import ResizingComponent from "../../components/ResizingComponent";
import Source from "../../models/source";
import ExpressJS from "./IntegrationExpressJS";
import GoogleFunction from "./IntegrationGoogleFunction";
import Java from "./IntegrationJava";
import NodeJS from "./IntegrationNodeJSLambda";

let TabsTheme = require("./themes/tabs.scss");

interface IntegrationPageProps {
    source: Source;
    showSecret?: boolean;
    goTo?: (path: string) => (dispatch: Redux.Dispatch<any>) => void;
}

interface IntegrationPageState {
    tabIndex: number;
}

export class IntegrationPage extends React.Component<IntegrationPageProps, IntegrationPageState> {

    constructor(props: IntegrationPageProps) {
        super(props);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleSettingsClick = this.handleSettingsClick.bind(this);
        this.state = {
            tabIndex: 0
        };
    }

    handleTabChange(index: number) {
        this.state.tabIndex = index;
        this.setState(this.state);
    }

    handleSettingsClick () {
        this.props.goTo(`/skills/${this.props.source && this.props.source.id}/settings`);
    }

    render() {
        const {tabIndex} = this.state;
        const {showSecret, source} = this.props;
        const secretKey = (source) ? source.secretKey : undefined;
        return (
            <ResizingComponent overflowY="hidden">
                <section>
                    <Tabs theme={TabsTheme} fixed inverse index={tabIndex} onChange={this.handleTabChange}>
                        <Tab label="Node.JS Lambda">
                            <ResizingComponent>
                                <NodeJS secretKey={secretKey} showSecret={showSecret}/>
                            </ResizingComponent>
                        </Tab>
                        <Tab label="Google Cloud Function">
                            <ResizingComponent>
                                <GoogleFunction secretKey={secretKey} showSecret={showSecret}/>
                            </ResizingComponent>
                        </Tab>
                        <Tab label="Express.JS">
                            <ResizingComponent>
                                <ExpressJS secretKey={secretKey} showSecret={showSecret}/>
                            </ResizingComponent>
                        </Tab>
                        <Tab label="Java">
                            <ResizingComponent>
                                <Java secretKey={secretKey} showSecret={showSecret}/>
                            </ResizingComponent>
                        </Tab>
                        <Tab label="Code-Free">
                            <ResizingComponent>
                                <Grid>
                                    <Cell style={{marginTop: 0}} col={12}>
                                        <div>
                                            <h4 style={{marginTop: 0}}>Code-Free Integration</h4>
                                            <p>The Code-Free SDK works with your service (either HTTP or Lambda) via our Bespoken Proxy.</p>
                                            <p>It automatically captures key information about how your service is operating, and it can pro-actively alert you about any issues with how it is working.</p>
                                            <p>To use it, simply configure the settings for your service on the <a href="#" onClick={this.handleSettingsClick}>Settings</a> page.</p>
                                        </div>
                                    </Cell>
                                </Grid>
                            </ResizingComponent>
                        </Tab>
                    </Tabs>
                </section>
            </ResizingComponent>
        );
    }
}

export default IntegrationPage;
