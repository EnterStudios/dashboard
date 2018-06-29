import * as moment from "moment";
import * as React from "react";

import BarChart, { BarProps, CountData } from "../../components/Graphs/Bar/CountChart";
import {Grid} from "../../components/Grid";
import * as LoadingComponent from "../../components/LoadingComponent";
import Query, { EndTimeParameter, SortParameter, SourceParameter, StartTimeParameter } from "../../models/query";
import Source from "../../models/source";
import LogService from "../../services/log";
import { AMAZON_ORANGE, GOOGLE_GREEN } from "../../utils/colors";
import SourceUtils from "../../utils/Source";

export interface BarProps extends BarProps {

}

interface SourceIntentSummaryProps extends LoadingComponent.LoadingComponentProps {
    source: Source;
    startDate: moment.Moment;
    endDate: moment.Moment;
    bars?: BarProps[];
    refreshInterval?: number;
}

interface SourceIntentSummaryState extends LoadingComponent.LoadingComponentState<CountData[]> {
    refreshId?: any;
}

class IntentSortParameter extends SortParameter {
    parameter = "count_sort";
}

export class SourceIntentSummary extends LoadingComponent.Component<CountData[], SourceIntentSummaryProps, SourceIntentSummaryState> {
    static bars: BarProps[] = [{
        dataKey: "Amazon.Alexa",
        name: "Alexa",
        fill: AMAZON_ORANGE,
        stackId: "a"
    }, {
        dataKey: "Google.Home",
        name: "Home",
        fill: GOOGLE_GREEN,
        stackId: "a"
    }];

    static defaultProps: SourceIntentSummaryProps = {
        source: undefined,
        startDate: moment().subtract(7, "days"),
        endDate: moment(),
        bars: SourceIntentSummary.bars,
        refreshInterval: 60000,
    };

    constructor(props: SourceIntentSummaryProps) {
        super(props, { data: [] } as SourceIntentSummaryState);
    }

    // componentDidMount () {
    //     this.props.refreshInterval && this.setState({...this.state, refreshId: setInterval(() => this.refresh(), this.props.refreshInterval)});
    // }

    // componentWillUnmount () {
    //     clearInterval(this.state.refreshId);
    // }

    async refresh () {
        const { source, startDate, endDate } = this.props;

        if (!source) return;
        this.mapState({ data: [] });
        const query: Query = new Query();
        query.add(new SourceParameter(source));
        query.add(new StartTimeParameter(startDate));
        query.add(new EndTimeParameter(endDate));
        const serviceData: any = await LogService.getIntentSummary(query);
        const mergedData = mergeIntentSummary(serviceData);
        this.mapState({data: mergedData});
    }

    shouldUpdate(oldProps: SourceIntentSummaryProps, newProps: SourceIntentSummaryProps) {
        if (!newProps) {
            return true;
        } else {
            return !SourceUtils.equals(newProps.source, oldProps.source)
                || !newProps.startDate.isSame(oldProps.startDate)
                || !newProps.endDate.isSame(oldProps.endDate);
        }
    }

    preLoad(props: SourceIntentSummaryProps) {
        return this.mapState({ data: [] });
    }

    startLoading(props: SourceIntentSummaryProps): Thenable<LogService.IntentSummary> {
        const { source, startDate, endDate } = props;

        if (!source) {
            return Promise.resolve({ count: [] });
        }

        const query: Query = new Query();
        query.add(new SourceParameter(source));
        query.add(new StartTimeParameter(startDate));
        query.add(new EndTimeParameter(endDate));
        query.add(new IntentSortParameter("desc"));

        return LogService.getIntentSummary(query);
    }

    map(data: LogService.IntentSummary): CountData[] {
        return mergeIntentSummary(data);
    }

    render() {
        const { data } = this.state;
        const { bars } = this.props;
        if (!data || data.length === 0) {
            return <div/>;
        }
        return (
            <div>
                <Grid style={{marginBottom: "-29px"}}>
                    <h4 className="graph-header">Number Of Events Per Intent</h4>
                </Grid>
                <div style={{ height: (data.length * 40) + 100 }} >
                    <BarChart
                        data={data}
                        bars={bars}
                    />
                </div>
            </div>
        );
    }
}

export default SourceIntentSummary;

class IntentCountData implements CountData {
    title: string;
    count?: number;
    "Amazon.Alexa"?: number;
    "Google.Home"?: number;
}

function mergeIntentSummary(summary: LogService.IntentSummary): IntentCountData[] {
    let merger: any = {};
    for (let bucket of summary.count) {
        let obj = merger[bucket.name];
        if (!obj) {
            obj = new IntentCountData();
            obj["title"] = bucket.name;
            obj["count"] = 0; // Initial.  Will be added to.  It needs to include everything.
            merger[bucket.name] = obj;
        }
        obj[bucket.origin] = bucket.count;
        obj["count"] += bucket.count;
    }

    const values = Object.keys(merger).map(key => merger[key]);
    return values;
}
