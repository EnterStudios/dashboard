import * as moment from "moment";
import * as React from "react";
import { Button } from "react-toolbox/lib/button";
import DailyEvents from "../../components/SourceSelector/DailyEventsBarChart";
import ResponseTime from "../../components/SourceSelector/ResponseTimeBarChart";
import Source from "../../models/source";
import SourceUtils from "../../utils/Source";
import SourceStats from "./ValidationPageEventStats";
import SuccessRadialChart from "./ValidationPageSuccessRadialChart";

const GlobalStatsStyle = require("./ValidationComponentGlobalStatsStyle.scss");
const ButtonTheme = require("../../themes/button_theme.scss");

interface ValidationPageGlobalStatsProps {
    setLoading: (value: boolean) => void;
    goTo: (path: string) => (dispatch: Redux.Dispatch<any>) => void;
    source: Source;
    startDate: moment.Moment;
    endDate: moment.Moment;
}

interface ValidationPageGlobalStatsState {
    dailyEventsData: any[];
    dailyEventsAverage: number;
    responseTimeData: any[];
    responseTimeAverage: number;
}

export default class ValidationPageGlobalStats extends React.Component<ValidationPageGlobalStatsProps, ValidationPageGlobalStatsState> {
    constructor(props: any) {
        super(props);

        this.handleCheckErrors = this.handleCheckErrors.bind(this);
    }

    handleCheckErrors () {
        this.props.goTo("/skills/" + this.props.source.id + "/logs");
    }

    shouldComponentUpdate (nextProps: ValidationPageGlobalStatsProps) {
        return !(SourceUtils.equals(nextProps.source, this.props.source) &&
            nextProps.startDate.diff(this.props.startDate, "minutes", true) <= 1
            && nextProps.endDate.diff(this.props.endDate, "minutes", true) <= 1);
    }

    render() {
        return (
            <div className={GlobalStatsStyle.container}>
                {/*<div className={`${GlobalStatsStyle.row} ${GlobalStatsStyle.processed_items}`}>*/}
                    {/*<span>2 ITEMS PROCESSED</span>*/}
                {/*</div>*/}
                <div className={GlobalStatsStyle.row}>
                    <div className={GlobalStatsStyle.radial}>
                        <SuccessRadialChart source={this.props.source} startDate={this.props.startDate} endDate={this.props.endDate} />
                    </div>
                    <div className={GlobalStatsStyle.stats}>
                        <SourceStats selectedEntries={["stats"]} source={this.props.source} startDate={this.props.startDate} endDate={this.props.endDate} />
                    </div>
                </div>
                <div className={GlobalStatsStyle.row}>
                    <Button
                        className={GlobalStatsStyle.check_errors}
                        theme={ButtonTheme}
                        raised={true}
                        primary={true}
                        onClick={this.handleCheckErrors}
                        label="CHECK ERRORS"/>
                </div>
                <div className={GlobalStatsStyle.row}>
                    <div className={GlobalStatsStyle.bars_container}>
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
