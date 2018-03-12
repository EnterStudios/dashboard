import * as moment from "moment";
import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { replace } from "react-router-redux";
import {setLoading} from "../actions/loading";
import {AmazonFlowFlag, setAmazonFlow} from "../actions/session";
import {getSources} from "../actions/source";
import AmazonVendorPane from "../components/AmazonVendorPane";
import List from "../components/List/List";
import ListItem from "../components/List/ListItem";
import SourceListGlobalStats from "../components/SourceSelector/SourceSelectorGlobalStats";
import SourceSelector from "../components/SourceSelector/SourceSelectorParentComponent";
import TwoPane from "../components/TwoPane";
import Source from "../models/source";
import { User } from "../models/user";
import { State } from "../reducers";
import WelcomePage from "./WelcomePage";

const SourcePagePaneStyle = require("../themes/amazon_pane.scss");

export interface SourceListPageProps {
    sources: Source[];
    getSources: () => Promise<Source[]>;
    finishLoading: boolean;
    user: User;
    amazonFlow: boolean;
    setAmazonFlow: (amazonFlow: boolean) => AmazonFlowFlag;
    goTo: (path: string) => (dispatch: Redux.Dispatch<any>) => void;
    source: Source;
    setLoading: any;
}

interface SourceListPageState {
    listItems: JSX.Element[];
}

function mapStateToProps(state: State.All) {
    return {
        sources: state.source.sources,
        finishLoading: state.source.finishLoading,
        amazonFlow: state.session.amazonFlow,
        user: state.session.user,
        source: state.source.currentSource,
    };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>) {
    return {
        setAmazonFlow: function (amazonFlow: boolean): AmazonFlowFlag {
            return dispatch(setAmazonFlow(amazonFlow));
        },
        goTo: function (path: string): any {
            return dispatch(replace(path));
        },
        getSources: function (): Promise<Source[]> {
            return dispatch(getSources());
        },
        setLoading: function (value: boolean) {
            return dispatch(setLoading(value));
        },
    };
}

export class SourceListPage extends React.Component<SourceListPageProps, SourceListPageState> {
    static defaultProps: SourceListPageProps = {
        sources: [],
        getSources: undefined,
        amazonFlow: false,
        finishLoading: false,
        user: undefined,
        setAmazonFlow: undefined,
        goTo: undefined,
        source: undefined,
        setLoading: undefined,
    };

    constructor(props: SourceListPageProps) {
        super(props);

        this.handleGotoIntegration = this.handleGotoIntegration.bind(this);
    }

    handleGotoIntegration () {
        this.props.goTo("/skills/" + this.props.source.id + "/integration");
    }

    render() {
        const hasAnySourceIntegrated = this.props.sources && this.props.sources.some((source: Source) => source.hasIntegrated);
        const leftSide = <SourceSelector />;

        let rightSide = (
            <div className={SourcePagePaneStyle.right_container}>
                {
                    // TODO: provisional condition for production vs dev right panel remove once tested and approved
                    process.env.NODE_ENV !== "production" ?
                        (
                            !hasAnySourceIntegrated ?
                                (
                                    <WelcomePage source={this.props.source} goTo={this.props.goTo}
                                                 handleLoadingChange={this.props.setLoading}
                                                 getSources={this.props.getSources}/>
                                ) :
                                (
                                    <SourceListGlobalStats setLoading={this.props.setLoading} source={this.props.source}
                                                           startDate={moment().subtract(7, "days")} endDate={moment()}/>
                                )
                        )
                        :
                        (
                            !hasAnySourceIntegrated ?
                                (
                                    <WelcomePage source={this.props.source} goTo={this.props.goTo}
                                                 handleLoadingChange={this.props.setLoading}
                                                 getSources={this.props.getSources}/>
                                ) :
                                (
                                    <div className={SourcePagePaneStyle.integrated_preview}>
                                        <div>we are updgrading with new cool charts</div>
                                        <a href={"#"} onClick={this.handleGotoIntegration}>go to integration page</a>
                                    </div>
                                )
                        )
                }
            </div>
        );

        return this.props.amazonFlow ? (<AmazonVendorPane spacing={true} isParentLoading={this.props.finishLoading} sources={this.props.sources} getSources={this.props.getSources} user={this.props.user} amazonFlow={this.props.amazonFlow} setAmazonFlow={this.props.setAmazonFlow} goTo={this.props.goTo} />) :
            (
                <TwoPane
                    gridClass={"source-list-grid"}
                    spacing={true}
                    leftStyle={{ padding: "0px 15px 0px 25px", backgroundColor: "#EEF2F5" }}
                    rightStyle={{ paddingRight: 0, paddingLeft: 0 }}>
                    {leftSide}
                    {rightSide}
                </TwoPane>
            );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(SourceListPage);

interface SourceListProps {
    sources: Source[];
}

interface SourceListState {
}

export class SourceList extends React.Component<SourceListProps, SourceListState> {

    constructor(props: SourceListProps) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
    }

    renderItem(index: number, key: string): JSX.Element {
        let source = this.props.sources[index];
        const secondaryValue = (source.created) ? moment(source.created).format("MMM Do, YYYY") : " ";
        return (
            <ListItem
                key={source.id}
                index={index}
                primaryValue={source.name}
                routeTo={"/skills/" + source.id}
                secondaryValue={secondaryValue} />
        );
    }

    render() {
        let element = (this.props.sources.length === 0) ?
            (
                <ul style={{ marginTop: "40px", fontSize: "1.1em" }}>
                    <li style={{ listStyle: "none", fontSize: "1.3em", marginLeft: "-20px", marginBottom: "5px" }}>You have not created any sources yet:</li>
                    <li>Setup a new source to begin logging and monitoring your skills and actions</li>
                    <li><Link to={"/skills/new"}>Just click here</Link> to get started (or on the "+" button below)</li>
                </ul>
            )
            :
            (
                <List
                    itemRenderer={this.renderItem}
                    length={this.props.sources.length} />
            );
        return element;
    }
}
