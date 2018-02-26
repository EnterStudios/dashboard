import * as React from "react";
import * as ReactCSSTransitionGroup from "react-addons-css-transition-group";
import {connect} from "react-redux";
import {replace} from "react-router-redux";
import {setLoading} from "../../actions/loading";
import {deleteSource, getSources, setCurrentSource} from "../../actions/source";
import Source from "../../models/source";
import {State} from "../../reducers";
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
}

interface SourceSelectorState {
}

function mapStateToProps(state: State.All) {
    return {
        source: state.source.currentSource,
        sources: state.source.sources,
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
    };
}

export class SourceSelector extends React.Component<SourceSelectorProps, SourceSelectorState> {

    constructor(props: SourceSelectorProps) {
        super(props);

        this.state = {
            loading: false,
        };

        this.handleSourceClick = this.handleSourceClick.bind(this);
        this.handleDeleteSource = this.handleDeleteSource.bind(this);
        this.handleLoadingChange = this.handleLoadingChange.bind(this);
    }

    componentDidUpdate (prevProps: SourceSelectorProps) {
        if (!prevProps.source || !this.props.source) {
            (this.props.setSource && this.props.sources && this.props.sources.length) && this.props.setSource(this.props.sources[0]);
        }
    }

    componentDidMount () {
        if (!this.props.source) {
            (this.props.setSource && this.props.sources && this.props.sources.length) && this.props.setSource(this.props.sources[0]);
        }
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

