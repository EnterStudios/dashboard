import * as moment from "moment";
import * as React from "react";
import ProgressBar from "react-toolbox/lib/progress_bar";
import {Grid} from "../../components/Grid";
import * as LoadingComponent from "../../components/LoadingComponent";
import Query, {
    EndTimeValueParameter,
    StartTimeValueParameter,
} from "../../models/query";
import Source from "../../models/source";
import MonitoringService from "../../services/monitoring";
import SourceUtils from "../../utils/Source";
import RadialChart from "../Graphs/Radial/ValidationRadialChart";

interface DailyEventsBarChartProps extends LoadingComponent.LoadingComponentProps {
    source: Source;
    startDate: moment.Moment;
    endDate: moment.Moment;
}

interface DailyEventsBarChartState extends LoadingComponent.LoadingComponentState<any> {
    successRatio: any;
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
        query.add(new EndTimeValueParameter(startDate.valueOf()));
        query.add(new StartTimeValueParameter(endDate.valueOf()));
        let successRatio: any;
        try {
            const monitorSummary = await MonitoringService.getUpTimeSummary(query, source.id);
            successRatio = (monitorSummary.filter(item => item.status === "up").length / monitorSummary.length) * 100;
        } catch (err) {
            successRatio = 0;
        }
        this.mapState({successRatio});
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
        query.add(new StartTimeValueParameter(startDate.valueOf()));
        query.add(new EndTimeValueParameter(endDate.valueOf()));
        let successRatio: any;
        try {
            const monitorSummary = await MonitoringService.getUpTimeSummary(query, source.id);
            successRatio = (monitorSummary.filter(item => item.status === "up").length / monitorSummary.length) * 100;
        } catch (err) {
            successRatio = 0;
        }
        return {successRatio};
    }

    map(data: MonitoringService.UpTimeSummary[]): MonitoringService.UpTimeSummary[] {
        return data;
    }

    onLoadError(err: Error) {
        return this.mapState([]);
    }

    render() {
        const {data} = this.state;
        if (!data || !data.successRatio) {
            return (
               <Grid style={{margin: 0, marginLeft: 200}} className="graph-loader">
                    <ProgressBar className="graph-loader" type="circular" mode="indeterminate" />
                </Grid>
            );
        }
        return (
            <RadialChart successRatio={data.successRatio} />
        );
    }
}

export default DailyEventsBarChart;
