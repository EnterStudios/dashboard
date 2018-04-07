import * as moment from "moment";
import * as React from "react";

import TimeChart, { LineProps, TimeData } from "../../components/Graphs/Line/TimeChart";
import * as LoadingComponent from "../../components/LoadingComponent";
import Query, { EndTimeParameter, FillGapsParameter, GranularityParameter, SortParameter, SourceParameter, StartTimeParameter } from "../../models/query";
import Source from "../../models/source";
import LogService from "../../services/log";
import { AMAZON_ORANGE, BLACK, GOOGLE_GREEN } from "../../utils/colors";
import SourceUtils from "../../utils/Source";

export interface LineProps extends LineProps {

}

interface SourceTimeSummaryProps extends LoadingComponent.LoadingComponentProps {
    source: Source;
    startDate: moment.Moment;
    endDate: moment.Moment;
    lines?: LineProps[];
    refreshInterval?: number;
}

interface SourceTimeSummaryState extends LoadingComponent.LoadingComponentState<TimeData[]> {
    refreshId?: any;
}

class TimeSortParameter extends SortParameter {
    parameter = "date_sort";
}

export class SourceTimeSummary extends LoadingComponent.Component<TimeData[], SourceTimeSummaryProps, SourceTimeSummaryState> {
    static lines: LineProps[] = [{
        dataKey: "total",
        name: "Total",
        stroke: BLACK
    }, {
        dataKey: "Amazon.Alexa",
        name: "Alexa",
        stroke: AMAZON_ORANGE
    }, {
        dataKey: "Google.Home",
        name: "Home",
        stroke: GOOGLE_GREEN
    }];

    static defaultProps: SourceTimeSummaryProps = {
        source: undefined,
        startDate: moment().subtract(7, "days"),
        endDate: moment(),
        lines: SourceTimeSummary.lines,
        refreshInterval: 60000,
    };

    constructor(props: SourceTimeSummaryProps) {
        super(props, { data: defaultPageTimeData(props.startDate, props.endDate) } as SourceTimeSummaryState);
        this.refresh = this.refresh.bind(this);
    }

    // componentDidMount () {
    //     this.props.refreshInterval && this.setState({...this.state, refreshId: setInterval(() => this.refresh(), this.props.refreshInterval)});
    // }

    // componentWillUnmount () {
    //     clearInterval(this.state.refreshId);
    // }

    async refresh () {
        const { source, startDate, endDate } = this.props;


        if (!source) return;
        this.mapState({ data: defaultPageTimeData(this.props.startDate, this.props.endDate) });
        const query: Query = new Query();
        query.add(new SourceParameter(source));
        query.add(new StartTimeParameter(startDate));
        query.add(new EndTimeParameter(endDate));
        query.add(new GranularityParameter("hour"));
        query.add(new TimeSortParameter("asc"));
        query.add(new FillGapsParameter(true));
        const serviceData: any = await LogService.getTimeSummary(query);
        const mergedData = mergeTimeSummary(serviceData);
        this.mapState({data: mergedData});
    }

    shouldUpdate(oldProps: SourceTimeSummaryProps, newProps: SourceTimeSummaryProps) {
        if (!newProps) {
            return true;
        } else {
            return !SourceUtils.equals(newProps.source, oldProps.source)
                || !newProps.startDate.isSame(oldProps.startDate)
                || !newProps.endDate.isSame(oldProps.endDate);
        }
    }

    preLoad(props: SourceTimeSummaryProps) {
        return this.mapState({ data: defaultPageTimeData(props.startDate, props.endDate) });
    }

    startLoading(props: SourceTimeSummaryProps): Thenable<LogService.TimeSummary> {
        const { source, startDate, endDate } = props;

        if (!source) {
            return Promise.resolve({
                buckets: [],
                amazonBuckets: [],
                googleBuckets: []
            });
        }

        const query: Query = new Query();
        query.add(new SourceParameter(source));
        query.add(new StartTimeParameter(startDate));
        query.add(new EndTimeParameter(endDate));
        query.add(new GranularityParameter("hour"));
        query.add(new TimeSortParameter("asc"));
        query.add(new FillGapsParameter(true));
        return LogService.getTimeSummary(query);
    }

    map(data: LogService.TimeSummary): PageTimeData[] {
        return mergeTimeSummary(data);
    }

    onLoadError(err: Error) {
        return this.mapState({ data: defaultPageTimeData(this.props.startDate, this.props.endDate) });
    }

    render() {
        const { data } = this.state;
        const { lines } = this.props;

        return (
            <TimeChart
                lines={lines}
                data={data} />
        );
    }
}

export default SourceTimeSummary;

class PageTimeData extends TimeData {
    total?: number;
    "Amazon.Alexa"?: number;
    "Google.Home"?: number;

    constructor(time: Date | moment.Moment) {
        super(time);
        this["total"] = 0;
        this["Amazon.Alexa"] = 0;
        this["Google.Home"] = 0;
    }
}

function defaultPageTimeData(start: moment.Moment, end: moment.Moment): PageTimeData[] {
    let data: PageTimeData[] = [];
    let currentDate: moment.Moment = start.clone();
    while (currentDate.isBefore(end)) {
        const newData: PageTimeData = new PageTimeData(currentDate);
        newData.total = 0;
        newData["Amazon.Alexa"] = 0;
        newData["Google.Home"] = 0;
        data.push(newData);
        currentDate.add(1, "hours");
    }
    return data;
}

function mergeTimeSummary(summary: LogService.TimeSummary): PageTimeData[] {
    const merger: any = {};

    joinBuckets(merger, summary.buckets, "total");
    joinBuckets(merger, summary.amazonBuckets, "Amazon.Alexa");
    joinBuckets(merger, summary.googleBuckets, "Google.Home");

    const values = Object.keys(merger)
        .map(key => merger[key])
        .sort(function (b1: PageTimeData, b2: PageTimeData): number {
            return b1.compare(b2);
        });
    return values;
}

function joinBuckets(merger: any, buckets: LogService.TimeBucket[], key: "total" | LogService.Origin) {
    for (let bucket of buckets) {
        const date = new Date(bucket.date);
        date.setMinutes(0, 0, 0);
        const dateString = date.toISOString();
        let obj: PageTimeData = merger[dateString];
        if (!obj) {
            obj = new PageTimeData(date);
        }
        obj[key] = bucket.count;
        merger[dateString] = obj;
    }
}
