import * as moment from "moment";
import * as React from "react";
import DailyEvents from "../../components/SourceSelector/DailyEventsBarChart";
import ResponseTime from "../../components/SourceSelector/ResponseTimeBarChart";
import Source from "../../models/source";
import SourceStats from "./SourceSelectorEventStats";
import SuccessRadialChart from "./SuccessRadialChart";

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

    render() {
        return (
            <div className={GlobalStatsStyle.container}>
                <div className={`${GlobalStatsStyle.row} ${GlobalStatsStyle.radial_wrap}`}>
                    <div className={GlobalStatsStyle.radial}>
                        <SuccessRadialChart source={this.props.source} startDate={this.props.startDate} endDate={this.props.endDate} />
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
                        </div>
                        <div className={GlobalStatsStyle.bars}>
                            <DailyEvents
                                source={this.props.source}
                                startDate={this.props.startDate}
                                endDate={this.props.endDate}/>
                        </div>
                        <div className={GlobalStatsStyle.bars}>
                            <ResponseTime
                                source={this.props.source}
                                startDate={this.props.startDate}
                                endDate={this.props.endDate}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
