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

interface ValidationPageRadialChartProps extends LoadingComponent.LoadingComponentProps {
    source: Source;
    startDate: moment.Moment;
    endDate: moment.Moment;
}

interface ValidationPageRadialChartState extends LoadingComponent.LoadingComponentState<any> {
    successRatio: any;
}

export class ValidationPageRadialChart extends LoadingComponent.Component<any, ValidationPageRadialChartProps, ValidationPageRadialChartState> {

    static defaultProps: ValidationPageRadialChartProps = {
        source: undefined,
        startDate: moment().subtract(7, "days"),
        endDate: moment(),
    };

    constructor(props: ValidationPageRadialChartProps) {
        super(props, {} as ValidationPageRadialChartState);
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

    shouldUpdate(oldProps: ValidationPageRadialChartProps, newProps: ValidationPageRadialChartProps) {
        if (!newProps) {
            return true;
        } else {
            return !SourceUtils.equals(newProps.source, oldProps.source)
                || !newProps.startDate.isSame(oldProps.startDate)
                || !newProps.endDate.isSame(oldProps.endDate);
        }
    }

    preLoad(props: ValidationPageRadialChartProps) {
        return this.mapState({data: [], sourceState: 1});
    }

    async startLoading(props: ValidationPageRadialChartProps): Promise<any> {
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
        if (!data || (!data.successRatio && data.successRatio !== 0)) {
            return (
               <Grid style={{margin: 0, width: 200}} className="graph-loader">
                    <ProgressBar className="graph-loader" type="circular" mode="indeterminate" />
                </Grid>
            );
        }
        return (
            <RadialChart successRatio={data.successRatio} small={true} />
        );
    }
}

export default ValidationPageRadialChart;
