import * as moment from "moment";
import * as React from "react";
import ProgressBar from "react-toolbox/lib/progress_bar";
import {Grid} from "../../components/Grid";
import * as LoadingComponent from "../../components/LoadingComponent";
import Query, {
    EndTimeParameter,
    FillGapsParameter,
    GranularityParameter,
    SourceParameter,
    StartTimeParameter,
} from "../../models/query";
import Source from "../../models/source";
import LogService from "../../services/log";
import MonitoringService from "../../services/monitoring";
import SourceUtils from "../../utils/Source";
import BarsChart from "../Graphs/Bar/BarsChart";

interface DailyEventsBarChartProps extends LoadingComponent.LoadingComponentProps {
    source: Source;
    startDate: moment.Moment;
    endDate: moment.Moment;
}

interface DailyEventsBarChartState extends LoadingComponent.LoadingComponentState<any> {
}

export class DailyEventsBarChart extends LoadingComponent.Component<any, DailyEventsBarChartProps, DailyEventsBarChartState> {

    static defaultProps: DailyEventsBarChartProps = {
        source: undefined,
        startDate: moment().subtract(7, "days"),
        endDate: moment(),
    };

    constructor(props: DailyEventsBarChartProps) {
        super(props, {} as DailyEventsBarChartState);
    }

    async refresh () {
        const { source, startDate, endDate } = this.props;
        if (!source) return;
        const query: Query = new Query();
        query.add(new SourceParameter(source));
        query.add(new StartTimeParameter(startDate));
        query.add(new EndTimeParameter(endDate));
        query.add(new GranularityParameter("hour"));
        query.add(new FillGapsParameter(true));
        let formatedData: any;
        let dailyEventsAverage;
        try {
            const timeSummary = await LogService.getTimeSummary(query);
            dailyEventsAverage = timeSummary.buckets.reduce((acum: any, bucket: any) => acum + (bucket.count / timeSummary.buckets.length), 0);
            formatedData = timeSummary.buckets;
        } catch (err) {
            formatedData = [];
        }
        this.mapState({summary: formatedData, dailyEventsAverage});
    }

    shouldUpdate(oldProps: DailyEventsBarChartProps, newProps: DailyEventsBarChartProps) {
        if (!newProps) {
            return true;
        } else {
            return !SourceUtils.equals(newProps.source, oldProps.source)
                || !newProps.startDate.isSame(oldProps.startDate)
                || !newProps.endDate.isSame(oldProps.endDate);
        }
    }

    preLoad(props: DailyEventsBarChartProps) {
        return this.mapState({data: [], sourceState: 1});
    }

    async startLoading(props: DailyEventsBarChartProps): Promise<any> {
        const { source, startDate, endDate } = this.props;
        if (!source) return;
        const query: Query = new Query();
        query.add(new SourceParameter(source));
        query.add(new StartTimeParameter(startDate));
        query.add(new EndTimeParameter(endDate));
        query.add(new GranularityParameter("hour"));
        query.add(new FillGapsParameter(true));
        let formatedData: any;
        let dailyEventsAverage;
        try {
            const timeSummary = await LogService.getTimeSummary(query);
            dailyEventsAverage = timeSummary.buckets.reduce((acum: any, bucket: any) => acum + (bucket.count / timeSummary.buckets.length), 0);
            formatedData = timeSummary.buckets;
        } catch (err) {
            formatedData = [];
        }
        return {summary: formatedData, dailyEventsAverage};
    }

    map(data: MonitoringService.UpTimeSummary[]): MonitoringService.UpTimeSummary[] {
        return data;
    }

    onLoadError(err: Error) {
        return this.mapState([]);
    }

    render() {
        const {data} = this.state;
        if (!data || !data.summary) {
            return (
               <Grid className="graph-loader">
                    <ProgressBar className="graph-loader" type="circular" mode="indeterminate" />
                </Grid>
            );
        }
        return (
            <BarsChart
                data={data.summary}
                bars={[{
                    dataKey: "count",
                    title: "Daily Events",
                    average: data.dailyEventsAverage.toFixed(2)
                }]}/>
        );
    }
}

export default DailyEventsBarChart;
