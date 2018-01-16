import * as moment from "moment";
import * as React from "react";
import { connect } from "react-redux";
import { replace, RouterAction } from "react-router-redux";
import DatePicker from "react-toolbox/lib/date_picker";

import { Cell, Grid } from "../../components/Grid";
import Source from "../../models/source";
import { State } from "../../reducers";
import AudioPlayerStats from "./AudioPlayerStats";
import AudioSessionNumber  from "./NumberSessions";
import AudioSessionDuration from "./SessionDuration";

const AudioPlayerPageStyle = require("./AudioPlayerPageStyle");
const datePickerThemeStart = require("../../themes/datepicker-bespoken-start.scss");
const datePickerThemeEnd = require("../../themes/datepicker-bespoken-end.scss");

interface AudioPlayerPageProps {
    source: Source;
    goHome: () => RouterAction;
}

interface AudioPlayerPageState {
    startDate: Date;
    endDate: Date;
}

function mapStateToProps(state: State.All) {
    return {
        source: state.source.currentSource
    };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>) {
    return {
        goHome: function (): RouterAction {
            return dispatch(replace("/skills"));
        }
    };
}

export class AudioPlayerPage extends React.Component<AudioPlayerPageProps, AudioPlayerPageState> {

    constructor(props: AudioPlayerPageProps) {
        super(props);

        this.state = {
            startDate: new Date(moment().subtract(7, "days")),
            endDate: new Date(moment()),
        };

        this.handleStartDateChange = this.handleDateChange.bind(this, "startDate");
        this.handleEndDateChange = this.handleDateChange.bind(this, "endDate");
    }

    handleStartDateChange = (item: any, value: any) => {};
    handleEndDateChange = (item: any, value: any) => {};
    handleDateChange = (item: any, value: any) => {
        this.setState((prevState: AudioPlayerPageState) => {
            return {...prevState, [item]: value};
        });
    }

    render() {
        const { source } = this.props;
        const sourceName = (source) ? source.id : "undefined";
        if (!source) {
            return (<div />);
        }
        return (
            <div style={{margin: 25}}>
                <Grid noSpacing={true}>
                    <Cell col={4}>
                        <Grid noSpacing={true}>
                            <Cell col={12}>
                                <Grid className={AudioPlayerPageStyle.padding_left}>
                                    <Cell col={12} phone={4}>
                                        <h3 className={`${AudioPlayerPageStyle.primary_text_color} ${AudioPlayerPageStyle.no_margin}`}>AUDIOPLAYER METRICS</h3>
                                    </Cell>
                                </Grid>
                            </Cell>
                            <Cell col={12}>
                                <Grid className={AudioPlayerPageStyle.padding_left}>
                                    <Cell col={6} phone={4}>
                                        <DatePicker theme={datePickerThemeStart} label="Start Date" onChange={this.handleStartDateChange} value={this.state.startDate} />
                                    </Cell>
                                    <Cell col={6} phone={4}>
                                        <DatePicker theme={datePickerThemeEnd} label="End Date" onChange={this.handleEndDateChange} value={this.state.endDate} />
                                    </Cell>
                                </Grid>
                            </Cell>
                            <Cell col={12}>
                                <Grid className={`${AudioPlayerPageStyle.padding_left} ${AudioPlayerPageStyle.padding_top}`}>
                                    <Cell tablet={8} col={12}>
                                        <AudioPlayerStats
                                            source={sourceName}
                                            startDate={moment(this.state.startDate)}
                                            endDate={moment(this.state.endDate)} />
                                    </Cell>
                                </Grid>
                            </Cell>
                        </Grid>
                    </Cell>
                    <Cell col={8}>
                        <Grid noSpacing={true}>
                            <Cell style={{marginBottom: 20}} col={12}>
                                <div className={AudioPlayerPageStyle.border_chart}>
                                    <AudioSessionDuration
                                        source={sourceName}
                                        startDate={moment(this.state.startDate)}
                                        endDate={moment(this.state.endDate)} />
                                </div>
                            </Cell>
                            <Cell col={12}>
                                <div className={AudioPlayerPageStyle.border_chart}>
                                    <AudioSessionNumber
                                        source={sourceName}
                                        startDate={moment(this.state.startDate)}
                                        endDate={moment(this.state.endDate)} />
                                </div>
                            </Cell>
                        </Grid>
                    </Cell>
                </Grid>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AudioPlayerPage);
