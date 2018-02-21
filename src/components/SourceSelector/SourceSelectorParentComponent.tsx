import * as React from "react";
import * as ReactCSSTransitionGroup from "react-addons-css-transition-group";
import {connect} from "react-redux";
import {replace} from "react-router-redux";
import {deleteSource, getSources, setCurrentSource} from "../../actions/source";
import Source from "../../models/source";
import {State} from "../../reducers";
import { Loader } from "../Loader/Loader";
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
}

interface SourceSelectorState {
    loading: boolean;
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
        }
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

    handleSourceClick (source: Source) {
        (this.props.source && this.props.source.id === source.id) ? this.props.setSource(undefined) : this.props.setSource(source);
    }

    handleLoadingChange (value: boolean) {
        this.setState(prevState => ({
            loading: value,
        }));
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
                        sourceType={"ALEXA SKILL"}
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
                                    sourceType={"ALEXA SKILL"}
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
                {this.state.loading && <Loader/>}
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SourceSelector);

