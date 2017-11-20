import * as moment from "moment";
import * as React from "react";

import DataTile from "../../components/DataTile";
import { Cell, Grid } from "../../components/Grid";
import * as LoadingComponent from "../../components/LoadingComponent";
import Query, { EndTimeParameter, SourceParameter, StartTimeParameter } from "../../models/query";
import LogService from "../../services/log";

const DEFAULT_VALUE: string = "N/A";
const LOADING_VALUE: string = "Loading...";

type ENTRY = "stats";

interface AudioPlayerStatsProps extends LoadingComponent.LoadingComponentProps {
    source: string;
    startDate: moment.Moment;
    endDate: moment.Moment;
    selectedEntries?: ENTRY | ENTRY[];
}

interface AudioPlayerStatsState extends LoadingComponent.LoadingComponentState<LogService.AudioPlayerStats> {
}

interface Labels {
    avgDuration: string;
    avgSessionsNumber: string;
}

function newStats(avgDuration: number = 0, avgSessions: number = 0): LogService.AudioPlayerTotalStats {
    return {
        avgDuration: avgDuration,
        avgSessionsNumber: avgSessions,
    };
}

function getLabel(audioStats: LogService.AudioPlayerTotalStats, state: LoadingComponent.LoadingState): Labels {
    if (state === LoadingComponent.LoadingState.LOADING) {
        return {
            avgDuration: LOADING_VALUE,
            avgSessionsNumber: LOADING_VALUE,
        };
    } else if (state === LoadingComponent.LoadingState.LOAD_ERROR || audioStats.avgDuration && audioStats.avgDuration.toString() === DEFAULT_VALUE) {
        return {
            avgDuration: DEFAULT_VALUE,
            avgSessionsNumber: DEFAULT_VALUE,
        };
    }

    let durationString = audioStats.avgDuration ? audioStats.avgDuration.toString() : DEFAULT_VALUE;
    let sessionsString = audioStats.avgSessionsNumber ? audioStats.avgSessionsNumber.toString() : DEFAULT_VALUE;
    if (audioStats.avgDuration) {
        const minutes = Math.floor(audioStats.avgDuration / 6000);
        const seconds = (audioStats.avgDuration % 6000) / 1000;
        durationString = ("0" + minutes).slice(-2) + "m:" + ("0" + seconds).slice(-2) + "s";
    }

    return {
        avgDuration: durationString,
        avgSessionsNumber: sessionsString,
    };
}



export class AudioPlayerStats extends LoadingComponent.Component<LogService.AudioPlayerStats, AudioPlayerStatsProps, AudioPlayerStatsState> {

    static defaultProps: AudioPlayerStatsProps = {
        source: undefined,
        startDate: moment().subtract(7, "days"),
        endDate: moment(),
        selectedEntries: ["stats"]
    };

    static defaultState: any = {
        data: {
                source: DEFAULT_VALUE,
                stats: newStats(),
            }
    };

    constructor(props: AudioPlayerStatsProps) {
        super(props, AudioPlayerStats.defaultState);
    }

    shouldUpdate(oldProps: AudioPlayerStatsProps, newProps: AudioPlayerStatsProps) {
        if (!newProps) {
            return oldProps.source !== undefined;
        } else {
            return newProps.source !== oldProps.source
                || !newProps.startDate.isSame(oldProps.startDate)
                || !newProps.endDate.isSame(oldProps.endDate);
        }
    }

    async startLoading(props: AudioPlayerStatsProps): Promise<LogService.AudioPlayerStats> {
        const query: Query = new Query();
        query.add(new SourceParameter(props.source));
        query.add(new StartTimeParameter(props.startDate));
        query.add(new EndTimeParameter(props.endDate));
        const [sessions, duration] = await Promise.all([LogService.getAudioSessions(query), LogService.getAudioDuration(query)]);
        const audioSessions = sessions.map((audioSession: any) => {
            const sessionStartTime = moment(audioSession._id.year + "-" + audioSession._id.month + "-" + audioSession._id.day).toISOString();
            return {
                sessionStartTime,
                amount: audioSession.count,
            };
        });
        const sessionsAmount = audioSessions.reduce((accum: any, item: any) => {
            return accum + item.amount;
        }, 0);
        const avgSessions = sessionsAmount / audioSessions.length;
        return {source: props.source, stats: {avgDuration: duration.averageAudioSessionDuration, avgSessionsNumber: avgSessions}};
    }

    render() {
        const { data, state } = this.state;
        const { avgDuration, avgSessionsNumber } = getLabel(data.stats, state);

        return (
            <Grid noSpacing={true}>
                <Cell phone={2} offsetTablet={1} tablet={3} col={6}>
                    <DataTile
                        smallWidth={true}
                        value={avgDuration}
                        label={"Average Duration"} />
                </Cell>
                <Cell phone={2} tablet={3} col={6}>
                    <DataTile
                        smallWidth={true}
                        value={avgSessionsNumber}
                        label={"Number of Sessions"} />
                </Cell>
            </Grid>
        );
    }
}

export default AudioPlayerStats;
