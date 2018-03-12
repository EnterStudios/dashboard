import * as moment from "moment";
import * as React from "react";
import BarsChart from "../../components/Graphs/Bar/BarsChart";
import RadialBarChart from "../../components/Graphs/Radial/ValidationRadialChart";
import {EndTimeParameter, FillGapsParameter, GranularityParameter, SourceParameter, StartTimeParameter} from "../../models/query";
import Query from "../../models/query";
import Source from "../../models/source";
import LogService from "../../services/log";
import SourceStats from "./SourceSelectorEventStats";

const GlobalStatsStyle = require("./SourceSelectorGlobalStatsStyle.scss");

interface SourceSelectorGlobalStatsProps {
    setLoading: (value: boolean) => void;
    source: Source;
    startDate: moment.Moment;
    endDate: moment.Moment;
}

interface SourceSelectorGlobalStatsState {
    dailyEventsData: any[];
    dailyEventsAverage: number;
    responseTimeData: any[];
    responseTimeAverage: number;
}

export default class SourceSelectorGlobalStats extends React.Component<SourceSelectorGlobalStatsProps, SourceSelectorGlobalStatsState> {
    constructor(props: any) {
        super(props);
    }

    async componentDidMount () {
        if (this.props.source) {
            const { source, startDate, endDate } = this.props;
            const query: Query = new Query();
            query.add(new SourceParameter(source));
            query.add(new StartTimeParameter(startDate));
            query.add(new EndTimeParameter(endDate));
            query.add(new GranularityParameter("hour"));
            query.add(new FillGapsParameter(true));
            const timeSummary = await LogService.getTimeSummary(query);
            const responseTimeService: any = await LogService.getResponseTimeSummary(query);
            const dailyEventsAverage = timeSummary.buckets.reduce((acum: any, bucket: any, index, array) => {
                return acum + (bucket.count / array.length);
            }, 0);
            const responseTimeAverage = responseTimeService.data.reduce((acum: any, bucket: any, index: any, array: any) => {
                return acum + (bucket.avgReponseTime / array.length);
            }, 0);
            this.setState(prevState => ({
                dailyEventsData: timeSummary.amazonBuckets,
                dailyEventsAverage,
                responseTimeData: responseTimeService.data,
                responseTimeAverage,
            }));
        }
    }

    async componentDidUpdate (prevProps: SourceSelectorGlobalStatsProps) {
        if (this.props.source && prevProps.source !== this.props.source) {
            const { source, startDate, endDate } = this.props;
            const query: Query = new Query();
            query.add(new SourceParameter(source));
            query.add(new StartTimeParameter(startDate));
            query.add(new EndTimeParameter(endDate));
            query.add(new GranularityParameter("hour"));
            query.add(new FillGapsParameter(true));
            const timeSummary = await LogService.getTimeSummary(query);
            const responseTimeService: any = await LogService.getResponseTimeSummary(query);
            const dailyEventsAverage = timeSummary.buckets.reduce((acum: any, bucket: any, index, array) => {
                return acum + (bucket.count / array.length);
            }, 0);
            const responseTimeAverage = responseTimeService.data.reduce((acum: any, bucket: any, index: any, array: any) => {
                return acum + (bucket.avgReponseTime / array.length);
            }, 0);
            this.setState(prevState => ({
                dailyEventsData: timeSummary.amazonBuckets,
                dailyEventsAverage,
                responseTimeData: responseTimeService.data,
                responseTimeAverage,
            }));
        }
    }

    render() {
        return (
            <div className={GlobalStatsStyle.container}>
                <div className={GlobalStatsStyle.row}>
                    <div className={GlobalStatsStyle.radial}>
                        <RadialBarChart successRatio={100} />
                    </div>
                    <div className={GlobalStatsStyle.stats}>
                        <SourceStats selectedEntries={["stats"]} source={this.props.source} startDate={this.props.startDate} endDate={this.props.endDate} />
                    </div>
                </div>
                <div className={GlobalStatsStyle.row}>
                    <div className={GlobalStatsStyle.bars_container}>
                        <div className={GlobalStatsStyle.date}>
                            <div>
                                Events <span>{moment().format("MMMM Do YYYY, h:mm:ss a")}</span>
                            </div>
                            <div>
                                dropdown
                            </div>
                        </div>
                        <div className={GlobalStatsStyle.bars}>
                            <BarsChart data={this.state && this.state.dailyEventsData} bars={[{
                                dataKey: "count",
                                title: "Daily Events",
                                average: this.state && this.state.dailyEventsAverage
                            }]}/>
                        </div>
                        <div className={GlobalStatsStyle.bars}>
                            <BarsChart data={this.state && this.state.responseTimeData} bars={[{
                                dataKey: "avgResponseTime",
                                title: "Average Response Time",
                                subtitle: "(milliseconds)",
                                average: this.state && this.state.responseTimeAverage,
                                fill: "#04A5E7"
                            }]}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
