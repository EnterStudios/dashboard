import * as React from "react";
import * as ReactCSSTransitionGroup from "react-addons-css-transition-group";
import {connect} from "react-redux";
import {replace} from "react-router-redux";
import {setLoading} from "../../actions/loading";
import {AmazonFlowFlag, setAmazonFlow} from "../../actions/session";
import {deleteSource, getSources, setCurrentSource} from "../../actions/source";
import Source from "../../models/source";
import {User, UserDetails} from "../../models/user";
import {State} from "../../reducers";
import auth from "../../services/auth";
import AmazonVendorPane from "../AmazonVendorPane";
import SourceSelectorCreate from "./SourceSelectorCreateComponent";
import SourceSelectorItem from "./SourceSelectorItemComponent";

const SourceSelectorStyle = require("./SourceSelectorParentStyle.scss");

interface SourceSelectorProps {
    source: Source;
    sources: Source[];
    getSources: () => Promise<Source[]>;
    setSource: (source: Source) => (dispatch: Redux.Dispatch<any>) => void;
    goTo: (path: string) => (dispatch: Redux.Dispatch<any>) => void;
    removeSource: (source: Source) => Promise<Source>;
    setLoading: (value: boolean) => (dispatch: Redux.Dispatch<any>) => void;
    finishLoading: boolean;
    user: User;
    amazonFlow: boolean;
    setAmazonFlow: (amazonFlow: boolean) => AmazonFlowFlag;
}

interface SourceSelectorState {
    userDetails: UserDetails;
}

function mapStateToProps(state: State.All) {
    return {
        source: state.source.currentSource,
        sources: state.source.sources,
        finishLoading: state.source.finishLoading,
        amazonFlow: state.session.amazonFlow,
        user: state.session.user,
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        getSources: function (): Promise<Source[]> {
            return dispatch(getSources());
        },
        setSource: function (source: Source) {
            return dispatch(setCurrentSource(source));
        },
        goTo: function (path: string) {
            return dispatch(replace(path));
        },
        removeSource: function (source: Source): Promise<Source> {
            return dispatch(deleteSource(source));
        },
        setLoading: function (value: boolean) {
            return dispatch(setLoading(value));
        },
        setAmazonFlow: function (amazonFlow: boolean): AmazonFlowFlag {
            return dispatch(setAmazonFlow(amazonFlow));
        },
    };
}

export class SourceSelector extends React.Component<SourceSelectorProps, SourceSelectorState> {

    constructor(props: SourceSelectorProps) {
        super(props);

        this.state = {
            userDetails: undefined,
        };

        this.handleSourceClick = this.handleSourceClick.bind(this);
        this.handleDeleteSource = this.handleDeleteSource.bind(this);
        this.handleLoadingChange = this.handleLoadingChange.bind(this);
    }

    componentDidUpdate (prevProps: SourceSelectorProps, prevState: SourceSelectorState) {
        if (!prevProps.source || !this.props.source) {
            (this.props.setSource && this.props.sources && this.props.sources.length) && this.props.setSource(this.props.sources[0]);
        }
    }

    async componentDidMount () {
        this.handleLoadingChange(true);
        if (!this.props.source) {
            (this.props.setSource && this.props.sources && this.props.sources.length) && this.props.setSource(this.props.sources[0]);
        }
        const userDetails: UserDetails = await auth.currentUserDetails();
        this.setState(() => ({
            userDetails,
        }));
        this.handleLoadingChange(false);
    }

    handleSourceClick (source: Source) {
        const defaultSource = this.props.sources && this.props.sources.length && this.props.sources[0];
        (this.props.source && this.props.source.id === source.id) ? this.props.setSource(defaultSource) : this.props.setSource(source);
    }

    handleLoadingChange (value: boolean) {
        this.props.setLoading(value);
    }

    handleDeleteSource (source: Source) {
        this.handleLoadingChange(true);
        this.props.removeSource(source);
        this.props.getSources();
        this.handleLoadingChange(false);
    }

    render() {
        const sortedSources = this.props.sources.sort(function(a, b) {
            return +new Date(b.created) - +new Date(a.created);
        });
        return (
            <div className={SourceSelectorStyle.container}>
                {
                    this.props.amazonFlow && this.state && (!this.state.userDetails || !this.state.userDetails.silentEchoToken || !this.state.userDetails.smAPIAccessToken) &&
                    (
                        <AmazonVendorPane
                            spacing={true}
                            isParentLoading={this.props.finishLoading}
                            sources={this.props.sources}
                            getSources={this.props.getSources}
                            user={this.props.user}
                            amazonFlow={this.props.amazonFlow}
                            setAmazonFlow={this.props.setAmazonFlow}
                            goTo={this.props.goTo}
                            setLoading={this.props.setLoading}/>
                    )
                }
                <ReactCSSTransitionGroup className={SourceSelectorStyle.container} transitionName={"pageSlider"} transitionEnterTimeout={500} transitionLeaveTimeout={500}>
                    <SourceSelectorCreate
                        defaultSourceNumber={this.props.sources.length.toString()}
                        handleLoadingChange={this.handleLoadingChange}
                        setSource={this.props.setSource}
                        getSources={this.props.getSources}
                        goTo={this.props.goTo} />
                    {
                        sortedSources &&
                        sortedSources.map((source, index) => {
                            const onclick = () => {
                                this.handleSourceClick(source);
                            };
                            const reverseIndex = sortedSources.length;
                            return (
                                <SourceSelectorItem
                                    key={reverseIndex - index}
                                    source={source}
                                    active={this.props.source && this.props.source.id === source.id}
                                    getSources={this.props.getSources}
                                    goTo={this.props.goTo}
                                    removeSource={this.handleDeleteSource}
                                    handleLoadingChange={this.handleLoadingChange}
                                    onClick={onclick}/>
                            );
                        })
                    }
                </ReactCSSTransitionGroup>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SourceSelector);

