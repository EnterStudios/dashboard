import * as moment from "moment";
import * as React from "react";
import ProgressBar from "react-toolbox/lib/progress_bar";
import {Grid} from "../../components/Grid";
import * as LoadingComponent from "../../components/LoadingComponent";
import Query, {
    EndTimeParameter,
    IntervalParameter,
    SourceParameter,
    StartTimeParameter,
} from "../../models/query";
import Source from "../../models/source";
import LogService from "../../services/log";
import MonitoringService from "../../services/monitoring";
import SourceUtils from "../../utils/Source";
import BarsChart from "../Graphs/Bar/BarsChart";

interface ResponseTimeBarChartProps extends LoadingComponent.LoadingComponentProps {
    source: Source;
    startDate: moment.Moment;
    endDate: moment.Moment;
}

interface ResponseTimeBarChartState extends LoadingComponent.LoadingComponentState<any> {
}

export class ResponseTimeBarChart extends LoadingComponent.Component<any, ResponseTimeBarChartProps, ResponseTimeBarChartState> {

    static defaultProps: ResponseTimeBarChartProps = {
        source: undefined,
        startDate: moment().subtract(7, "days"),
        endDate: moment(),
    };

    constructor(props: ResponseTimeBarChartProps) {
        super(props, {} as ResponseTimeBarChartState);
    }

    async refresh () {
        const { source, startDate, endDate } = this.props;
        if (!source) return;
        const query: Query = new Query();
        query.add(new SourceParameter(source));
        query.add(new StartTimeParameter(startDate));
        query.add(new EndTimeParameter(endDate));
        query.add(new IntervalParameter(5));
        let formatedData: any;
        let avgResponseTime;
        try {
            const responseTime: any = await LogService.getResponseTimeSummary(query);
            avgResponseTime = responseTime.data.reduce((acum: any, item: any) => acum + (item.avgReponseTime / responseTime.data.length), 0);
            formatedData = responseTime.data;
        } catch (err) {
            formatedData = [];
        } finally {
            avgResponseTime = avgResponseTime || 0;
        }
        this.mapState({summary: formatedData, avgResponseTime});
    }

    shouldUpdate(oldProps: ResponseTimeBarChartProps, newProps: ResponseTimeBarChartProps) {
        if (!newProps) {
            return true;
        } else {
            return !SourceUtils.equals(newProps.source, oldProps.source)
                || !newProps.startDate.isSame(oldProps.startDate)
                || !newProps.endDate.isSame(oldProps.endDate);
        }
    }

    preLoad(props: ResponseTimeBarChartProps) {
        return this.mapState({data: [], sourceState: 1});
    }

    async startLoading(props: ResponseTimeBarChartProps): Promise<any> {
        const { source, startDate, endDate } = this.props;
        if (!source) return;
        const query: Query = new Query();
        query.add(new SourceParameter(source));
        query.add(new StartTimeParameter(startDate));
        query.add(new EndTimeParameter(endDate));
        query.add(new IntervalParameter(5));
        let formatedData: any;
        let avgResponseTime;
        try {
            const responseTime: any = await LogService.getResponseTimeSummary(query);
            avgResponseTime = responseTime.data.reduce((acum: any, item: any) => acum + (item.avgReponseTime / responseTime.data.length), 0);
            formatedData = responseTime.data;
        } catch (err) {
            formatedData = [];
        } finally {
            avgResponseTime = avgResponseTime || 0;
        }
        return {summary: formatedData, avgResponseTime};
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
                    dataKey: "avgResponseTime",
                    title: "Average Response Time",
                    subtitle: "(milliseconds)",
                    average: data.avgResponseTime.toFixed(2),
                    fill: "#04A5E7"
                }]}/>
        );
    }
}

export default ResponseTimeBarChart;
