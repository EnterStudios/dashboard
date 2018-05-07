import * as moment from "moment";
import * as React from "react";
import * as LoadingComponent from "../../components/LoadingComponent";
import Query, { EndTimeParameter, SourceParameter, StartTimeParameter } from "../../models/query";
import Source from "../../models/source";
import LogService from "../../services/log";
import SourceUtils from "../../utils/Source";

const DEFAULT_VALUE: string = "N/A";

const SourceEventsStyle = require("./SourceSelectorEventStatsStyle.scss");
const LOADING_VALUE: string = "Loading...";

type ENTRY = "stats" | "Amazon.Alexa" | "Google.Home" | "Unknown";

interface Labels {
    eventsLabel: string;
    usersLabel: string;
    errorsLabel: string;
}

interface SourceEventsProps extends LoadingComponent.LoadingComponentProps {
    source: Source;
    startDate: moment.Moment;
    endDate: moment.Moment;
    selectedEntries?: ENTRY | ENTRY[];
}

interface SourceEventsState extends LoadingComponent.LoadingComponentState<LogService.SourceStats> {
}

function newStats(users: number = 0, exceptions: number = 0, events: number = 0): LogService.TotalStat {
    return {
        totalUsers: 0,
        totalExceptions: 0,
        totalEvents: 0
    };
}

function addStats(stats: LogService.TotalStat[]): LogService.TotalStat {
    let addedStats = newStats();
    for (let stat of stats) {
        addedStats.totalEvents += stat.totalEvents;
        addedStats.totalExceptions += stat.totalExceptions;
        addedStats.totalUsers += stat.totalUsers;
    }
    return addedStats;
}

function getLabel(sourceStats: LogService.SourceStats, state: LoadingComponent.LoadingState, entries: ENTRY | ENTRY[]): Labels {
    if (state === LoadingComponent.LoadingState.LOADING) {
        return {
            eventsLabel: LOADING_VALUE,
            usersLabel: LOADING_VALUE,
            errorsLabel: LOADING_VALUE
        };
    } else if (state === LoadingComponent.LoadingState.LOAD_ERROR || sourceStats.source === DEFAULT_VALUE) {
        return {
            eventsLabel: DEFAULT_VALUE,
            usersLabel: DEFAULT_VALUE,
            errorsLabel: DEFAULT_VALUE
        };
    }

    const selectedEntries = (entries instanceof Array) ? entries : [entries];
    const selectedStats: LogService.TotalStat[] = [];
    for (let entry of selectedEntries) {
        const stat = sourceStats[entry];
        if (stat) {
            selectedStats.push(stat);
        }
    }

    const stats = addStats(selectedStats);

    return {
        eventsLabel: stats.totalEvents.toString(),
        usersLabel: stats.totalUsers.toString(),
        errorsLabel: stats.totalExceptions.toString()
    };
}


export class SourceEvents extends LoadingComponent.Component<LogService.SourceStats, SourceEventsProps, SourceEventsState> {

    static defaultProps: SourceEventsProps = {
        source: undefined,
        startDate: moment().subtract(7, "days"),
        endDate: moment(),
        selectedEntries: ["stats"]
    };

    static defaultState: any = {
        data: {
            source: DEFAULT_VALUE,
            stats: newStats(),
            "Amazon.Alexa": newStats(),
            "Google.Home": newStats(),
            Unknown: newStats()
        }
    };

    constructor(props: SourceEventsProps) {
        super(props, SourceEvents.defaultState);
    }

    shouldUpdate(oldProps: SourceEventsProps, newProps: SourceEventsProps) {
        if (!newProps) {
            return oldProps.source !== undefined;
        } else {
            return !(SourceUtils.equals(newProps.source, this.props.source) &&
                newProps.startDate.diff(this.props.startDate, "minutes", true) <= 1
                && newProps.endDate.diff(this.props.endDate, "minutes", true) <= 1);
        }
    }

    startLoading(props: SourceEventsProps): Thenable<LogService.SourceStats> {
        const { source, startDate, endDate } = props;
        const query: Query = new Query();
        query.add(new SourceParameter(source));
        query.add(new StartTimeParameter(startDate));
        query.add(new EndTimeParameter(endDate));
        return LogService.getSourceSummary(query);
    }

    render() {
        const { selectedEntries } = this.props;
        const { data, state } = this.state;
        const { eventsLabel, usersLabel, errorsLabel } = getLabel(data, state, selectedEntries);

        return (
            <div className={SourceEventsStyle.container}>
                <div>
                    <span>Total events </span><span>{eventsLabel}</span>
                </div>
                <div>
                    <span>Unique Users </span><span>{usersLabel}</span>
                </div>
                <div>
                    <span>Total errors </span><span>{errorsLabel}</span>
                </div>
            </div>
        );
    }
}

export default SourceEvents;
