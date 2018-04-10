import * as moment from "moment";
import * as React from "react";
import { connect } from "react-redux";

import { findLatest, nextPage, PageResults, retrieveLogs } from "../../actions/log";
import Conversation from "../../models/conversation";
import ConversationList from "../../models/conversation-list";
import Log from "../../models/log";
import LogQuery from "../../models/log-query";
import Source from "../../models/source";
import { State } from "../../reducers";
import { LogQueryEvent } from "../../reducers/log";
import BrowserUtils from "../../utils/browser";
import Interval from "../../utils/Interval";
import { Location } from "../../utils/Location";
import { filter, FilterResult } from "../../utils/promise";
import SourceUtil from "../../utils/Source";
import { DateFilter } from "./filters/ConvoFilters";
import { CompositeFilter } from "./filters/Filters";
import ConvoList from "./list/ConvoList";

const LIMIT: number = 50;
// const UPDATE_TIME_MS = 5000;

interface DateRange {
    startTime?: moment.Moment;
    endTime?: moment.Moment;
}

interface ConvoListPageStateProps {
    source: Source;
}

interface ConvoListPageReduxProps {
    getLogs: (query: LogQuery, location?: Location) => Promise<Log[]>;
    newPage: (logQueryEvent: LogQueryEvent, limit: number) => Promise<PageResults>;
    refresh: (logQueryEvent: LogQueryEvent) => Promise<PageResults>;
}

interface ConvoListPageStandardProps {
    refreshOn?: boolean;
    filter?: CompositeFilter<Conversation>;
    iconStyle?: React.CSSProperties;
    iconTooltip?: string;
    onItemClick?: (conversation: Conversation, setQueryParams: boolean) => void;
    onIconClick?: (conversation: Conversation) => void;
}

interface ConvoListPageProps extends ConvoListPageStateProps, ConvoListPageReduxProps, ConvoListPageStandardProps {
}

interface ConvoListPageState {
    query: LogQuery;
    lastLogs: Log[];
    conversations: ConversationList;
    shownConversations: ConversationList;
    endReached: boolean;
}

interface ConvoListChildContext {
    location: Location;
}

function mapStateToProps(state: State.All): ConvoListPageStateProps {
    return {
        source: state.source.currentSource
    };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>): ConvoListPageReduxProps {
    return {
        getLogs: function (query: LogQuery, location?: Location): Promise<Log[]> {
            const fetchLogs = retrieveLogs(query, undefined, location);
            return fetchLogs(dispatch);
        },
        newPage: function (query: LogQueryEvent, limit: number): Promise<PageResults> {
            const fetchLogs = nextPage(query, limit);
            return fetchLogs(dispatch);
        },
        refresh: function (query: LogQueryEvent): Promise<PageResults> {
            const fetchLogs = findLatest(query);
            return fetchLogs(dispatch);
        }
    };
}

function mergeProps(stateProps: ConvoListPageStateProps, dispatchProps: ConvoListPageReduxProps, parentProps: ConvoListPageStandardProps): ConvoListPageProps {
    return { ...parentProps, ...dispatchProps, ...stateProps };
}

function getDateRange(filter: CompositeFilter<any>): DateRange {
    let range: DateRange = {};
    const dateFilter = (filter) ? filter.getFilter(DateFilter.type) as DateFilter : undefined;
    if (dateFilter) {
        range = { ...{ startTime: dateFilter.startMoment, endTime: dateFilter.endMoment } };
    }
    return range;
}

function differentRanges(range1: DateRange | LogQuery, range2: DateRange | LogQuery) {
    const start1 = (range1 && range1.startTime) ? moment(range1.startTime) : moment();
    const start2 = (range2 && range2.startTime) ? moment(range2.startTime) : moment();

    if (!start1.isSame(start2)) {
        return true;
    }

    const end1 = (range1 && range1.endTime) ? moment(range1.endTime) : moment();
    const end2 = (range2 && range2.endTime) ? moment(range2.endTime) : moment();

    if (!end1.isSame(end2)) {
        return true;
    }

    return false;
}

interface ConvoListContext {
    location?: Location;
}

export class ConvoListPage extends React.Component<ConvoListPageProps, ConvoListPageState> {

    refresher: Interval.Executor;
    isLoading: boolean;
    context: ConvoListContext;

    static contextTypes = {
        location: React.PropTypes.object
    };

    static childContextTypes = {
        location: React.PropTypes.object
    };

    constructor(props: ConvoListPageProps) {
        super(props);

        this.checkIfMoreNeeded = this.checkIfMoreNeeded.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.filterConvo = this.filterConvo.bind(this);
        this.setState = this.setState.bind(this);

        // this.refresher = Interval.newExecutor(UPDATE_TIME_MS, this.getRefresh.bind(this));

        this.state = {
            conversations: [],
            shownConversations: [],
            lastLogs: [],
            endReached: false,
            query: undefined
        };
    }

    getChildContext(): ConvoListChildContext {
      return { location: this.context.location };
    }

    componentWillReceiveProps(nextProps: ConvoListPageProps, context: any) {
        if (nextProps.refreshOn) {
            // this.refresher.start();
        } else {
            // this.refresher.end();
        }

        if (nextProps.source) {
            const range = getDateRange(nextProps.filter);
            if (!SourceUtil.equals(nextProps.source, this.props.source) ||
                differentRanges(range, this.state.query) || !(this.props.refreshOn === nextProps.refreshOn)) {
                this.getFreshLogs(nextProps);
            } else {
                // Same source, just filter what we have.
                this.filterConvo({ ...this.state }, nextProps)
                    .then(this.setState)
                    .then(this.checkIfMoreNeeded);
            }
        } else if (this.props.source) {
            // We're going from defined to undefined. Clear everything.
            this.setState({
                conversations: [],
                shownConversations: [],
                query: undefined,
                lastLogs: [],
                endReached: true
            });
        }
    }

    componentWillMount() {
        if (this.props.source) {
            this.getFreshLogs(this.props);
        }
    }

    componentWillUnmount() {
        // this.refresher.end();
    }

    checkIfMoreNeeded() {
        if (this.context.location && this.context.location.query && this.context.location.query.id) {
            return false;
        }
        if (!this.state.endReached && this.state.shownConversations.length < LIMIT) {
            this.getNextPage();
        }
    }

    handleScroll(firstVisibleIndex: number, lastVisibleIndex: number, totalCount: number) {
        if (!this.isLoading && !this.state.endReached && totalCount - lastVisibleIndex < 5) {
            this.getNextPage();
        }
    }

    getFreshLogs(props: ConvoListPageProps) {
        const range = getDateRange(props.filter);
        const query: LogQuery = new LogQuery({
            source: props.source,
            startTime: range.startTime,
            endTime: range.endTime,
            limit: 50
        });

        let newState = { ...this.state };

        props.getLogs(query, this.context.location)
            .then((logs: Log[]) => {
                const conversations = ConversationList.fromLogs(logs);
                newState = {
                    conversations: conversations,
                    shownConversations: conversations,
                    query: query,
                    lastLogs: logs,
                    endReached: false
                };
                return newState;
            })
            .then(this.filterConvo)
            .then(this.setState)
            .then(this.checkIfMoreNeeded);
    }

    getNextPage() {
        this.isLoading = true;
        const newState = { ...this.state };
        const filterConvo = this.filterConvo;
        this.props
            .newPage({ query: this.state.query, logs: this.state.lastLogs }, 50)
            .then(function (result: PageResults) {
                const endReached = result.newLogs.length === 0;
                newState.endReached = endReached;
                if (!endReached) {
                    // The reason we can't just append right now is because we may have partial conversations from the previous batch.
                    const newConversations = ConversationList.fromLogs(result.totalLogs);
                    newState.conversations = newConversations;
                    newState.lastLogs = result.totalLogs;
                    return filterConvo(newState);
                } else {
                    return newState;
                }
            })
            .then((state: ConvoListPageState) => {
                this.isLoading = false;
                return state;
            })
            .then(this.setState)
            .then(this.checkIfMoreNeeded);
    }

    getRefresh() {
        this.isLoading = true;
        const newState = { ...this.state };
        const filterConvo = this.filterConvo;
        this.props
            .refresh({ query: this.state.query, logs: this.state.lastLogs })
            .then((result: PageResults) => {
                if (result.newLogs.length > 0) {
                    // The reason we can't just preppend right now is because we may have partial conversations from the previous batch.
                    const newConversations = ConversationList.fromLogs(result.totalLogs);
                    newState.conversations = newConversations;
                    newState.lastLogs = result.totalLogs;
                    return filterConvo(newState);
                } else {
                    return newState;
                }
            }).then((state: ConvoListPageState) => {
                this.isLoading = false;
                return state;
            }).then(this.setState);
    }

    filterConvo(state: ConvoListPageState, props?: ConvoListPageProps) {
        if (this.context.location && this.context.location.query && this.context.location.query.id) {
            return new Promise<ConvoListPageState>((resolve, reject) => {
                resolve(state);
            });
        }
        const useProps = props || this.props;
        return filter(state.conversations, useProps.filter.filter)
            .then((result: FilterResult<Conversation>) => {
                let items = result.result;
                state.shownConversations = items;
            }).catch(function (err: Error) {
                state.shownConversations = state.conversations;
            }).then(function () {
                return state;
            });
    }

    render() {
        let { ...others } = this.props;
        const errMsg = (this.state.conversations.length === 0) ?
            (<p style={{ width: "100%", textAlign: "center", marginTop: "20px", fontSize: "1.5em"}}> No logs have been sent yet!</p>) :
            (<div />);
        return (
            <div>
                {errMsg}
                <ConvoList
                    {...others}
                    expandListItemWhenActive={BrowserUtils.isMobileWidth()}
                    onClick={this.props.onItemClick}
                    onScroll={this.handleScroll}
                    conversations={this.state.shownConversations}
                />
            </div>
        );
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(ConvoListPage);
