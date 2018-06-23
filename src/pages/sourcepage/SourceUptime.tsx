import * as moment from "moment";
import * as React from "react";
import ProgressBar from "react-toolbox/lib/progress_bar";

import UpTimeChart, {UpTimeData} from "../../components/Graphs/Line/UpTimeChart";
import {Grid} from "../../components/Grid";
import * as LoadingComponent from "../../components/LoadingComponent";
import Query, {EndTimeValueParameter, StartTimeValueParameter} from "../../models/query";
import Source from "../../models/source";
import MonitoringService from "../../services/monitoring";
import SourceUtils from "../../utils/Source";

interface SourceUpTimeProps extends LoadingComponent.LoadingComponentProps {
    source: Source;
    startDate: moment.Moment;
    endDate: moment.Moment;
    handleShowUpTime?: any;
    handleShowEmptyGraph?: any;
    refreshInterval?: number;
}

interface SourceUpTimeState extends LoadingComponent.LoadingComponentState<{ summary: UpTimeData[], status: number }> {
    refreshId?: any;
}

export class SourceUpTime extends LoadingComponent.Component<{ summary: UpTimeData[], status: number }, SourceUpTimeProps, SourceUpTimeState> {

    static defaultProps: SourceUpTimeProps = {
        source: undefined,
        startDate: moment().subtract(7, "days"),
        endDate: moment(),
        refreshInterval: 60000,
    };

    constructor(props: SourceUpTimeProps) {
        super(props, {data: {summary: [], status: 1}} as SourceUpTimeState);
    }

    // componentDidMount () {
    //     this.props.refreshInterval && this.setState({...this.state, refreshId: setInterval(() => this.refresh(), this.props.refreshInterval)});
    // }

    // componentWillUnmount () {
    //     clearInterval(this.state.refreshId);
    // }

    async refresh () {
        const { source } = this.props;
        if (!source) return;
        this.mapState({ data: [], sourceState: 1});
        const query: Query = new Query();
        query.add(new StartTimeValueParameter(moment().subtract(7, "days").valueOf()));
        query.add(new EndTimeValueParameter(moment().valueOf()));

        let formatedData;
        try {
            const [sourceStatus, sourcePings] = await Promise.all([MonitoringService.getSourceStatus(source.id), MonitoringService.getUpTimeSummary(query, source.id)]);
            this.props.handleShowUpTime && this.props.handleShowUpTime(sourceStatus && sourcePings.length > 0);
            formatedData = await formatUpTimeSummary({ summary: sourcePings, status: sourceStatus.status === "up" ? 1 : 0});
        } catch (err) {
            this.props.handleShowUpTime && this.props.handleShowUpTime(false);
            formatedData = await formatUpTimeSummary({ summary: [], status: 0});
        }
        this.mapState({data: formatedData});
    }

    shouldUpdate(oldProps: SourceUpTimeProps, newProps: SourceUpTimeProps) {
        if (!newProps) {
            return true;
        } else {
            return !SourceUtils.equals(newProps.source, oldProps.source)
                || !newProps.startDate.isSame(oldProps.startDate)
                || !newProps.endDate.isSame(oldProps.endDate);
        }
    }

    preLoad(props: SourceUpTimeProps) {
        return this.mapState({data: [], sourceState: 1});
    }

    async startLoading(props: SourceUpTimeProps): Promise<any> {
        const {source, startDate, endDate} = props;

        if (!source) {
            return [];
        }

        const query: Query = new Query();
        query.add(new StartTimeValueParameter(startDate.valueOf()));
        query.add(new EndTimeValueParameter(endDate.valueOf()));
        try {
            const [sourceStatus, sourcePings] = await Promise.all([MonitoringService.getSourceStatus(source.id), MonitoringService.getUpTimeSummary(query, source.id)]);
            this.props.handleShowUpTime && this.props.handleShowUpTime(sourceStatus && sourcePings.length > 0);
            this.props.handleShowEmptyGraph && this.props.handleShowEmptyGraph(!(sourceStatus && sourcePings.length > 0));
            return sortUpTimeSummary(formatUpTimeSummary({
                summary: sourcePings,
                status: !sourceStatus ? 2 : sourceStatus && sourceStatus.status === "up" ? 1 : 0
            }));
        } catch (err) {
            this.props.handleShowUpTime && this.props.handleShowUpTime(false);
            this.props.handleShowEmptyGraph && this.props.handleShowEmptyGraph(true);
            return sortUpTimeSummary(formatUpTimeSummary({summary: [], status: 0}));
        }
    }

    map(data: MonitoringService.UpTimeSummary[]): MonitoringService.UpTimeSummary[] {
        return data;
    }

    onLoadError(err: Error) {
        return this.mapState([]);
    }

    render() {
        const {data} = this.state;
        if (data && data.status === 2) {
            return (
                <Grid className="graph-loader" style={{justifyContent: "center"}}>
                    No data available yet
                </Grid>
            );
        } else if (!data || !data.summary) {
            return (
               <Grid className="graph-loader">
                    <ProgressBar className="graph-loader" type="circular" mode="indeterminate" />
                </Grid>
            );
        }
        return (
            <UpTimeChart
                startDate={this.props.startDate}
                endDate={this.props.endDate}
                data={data.summary}
                status={data.status}/>
        );
    }
}

export default SourceUpTime;

function formatUpTimeSummary(result: { summary: MonitoringService.UpTimeSummary[], status: number }): { summary: any, status: number } {
    const data = result.summary.map((item, i) => {
        return {
            source: item.source,
            status: item.status,
            timestamp: item.timestamp,
            statusValue: item.status === "up" ? 1 : 0
        };
    });
    return {summary: data, status: result.status};
}

function sortUpTimeSummary(result: { summary: MonitoringService.UpTimeSummary[], status: number }): { summary: any, status: number } {
    const data = result.summary.sort((a, b) => {
        return a.timestamp - b.timestamp;
    });
    return {summary: data, status: result.status};
}
