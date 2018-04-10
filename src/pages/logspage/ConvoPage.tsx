import * as React from "react";
import { connect } from "react-redux";

import VisibilityWatcher, { VISIBLITY_STATE } from "../../components/VisibilityWatcher";
import Conversation from "../../models/conversation";
import Source from "../../models/source";
import { State } from "../../reducers";
import DateUtils from "../../utils/date";
import { Location } from "../../utils/Location";
import ConvoExplorerPage from "./ConvoExplorerPage";
import FilterBar, { DateRange } from "./FilterBar";
import { DateFilter, UserIDFilter } from "./filters/ConvoFilters";
import { CompositeFilter, Filter } from "./filters/Filters";

const TOOLTIP_ACTIVE = "Unset Filter";
const TOOLTIP_DEACTIVE = "Filter User";
const ACTIVE_ICON_STYLE: React.CSSProperties = {
    background: "#AAAAAA"
};

interface ConvoListChildContext {
    location: Location;
}

interface ConvoPageStateProps {
    source: Source;
}

interface ConvoPageDispatchProps {
}

interface ConvoPageProps extends ConvoPageStateProps, ConvoPageDispatchProps {
    location?: Location;
}

interface ConvoPageState {
    dateRange: DateRange;
    filter: CompositeFilter<Conversation>;
    refreshOn: boolean;
    refreshDisabled: boolean;
    savedRefreshState: boolean;
    iconStyle: React.CSSProperties;
    iconTooltip: string;
}

function mapStateToProps(state: State.All): ConvoPageStateProps {
    return {
        source: state.source.currentSource
    };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>): ConvoPageDispatchProps {
    return {};
}

export class ConvoPage extends React.Component<ConvoPageProps, ConvoPageState> {

    static childContextTypes = {
        location: React.PropTypes.object
    };

    constructor(props: ConvoPageProps) {
        super(props);

        this.handleFilter = this.handleFilter.bind(this);
        this.handleLiveUpdate = this.handleLiveUpdate.bind(this);
        this.handleDateFilter = this.handleDateFilter.bind(this);
        this.handleVisiblityChange = this.handleVisiblityChange.bind(this);
        this.handleIconClick = this.handleIconClick.bind(this);

        const startDate: Date = DateUtils.daysAgo(7);
        startDate.setHours(0, 0, 0, 0);

        const endDate: Date = DateUtils.daysAgo(0);
        endDate.setHours(23, 59, 59, 999);

        const initialFilter = new DateFilter(startDate, endDate);

        this.state = {
            dateRange: { startTime: initialFilter.startDate, endTime: initialFilter.endDate },
            filter: new CompositeFilter([initialFilter]),
            refreshDisabled: false,
            refreshOn: this.props.location.query.id ? false : true,
            savedRefreshState: true,
            iconStyle: undefined,
            iconTooltip: TOOLTIP_DEACTIVE
        };
    }

    getChildContext(): ConvoListChildContext {
      return { location: this.props.location };
    }

    handleFilter(filter: Filter<Conversation>) {
        this.state.filter = this.state.filter.copyAndAddOrReplace(filter);
        this.setState(this.state);
    }

    handleDateFilter(filter: DateFilter) {
        const endIsToday = isToday(filter.endDate);
        this.state.dateRange = { startTime: filter.startDate, endTime: filter.endDate };
        this.state.refreshOn = endIsToday;
        this.state.refreshDisabled = !endIsToday;
        this.handleFilter(filter);
    }

    handleIconClick(convo: Conversation) {
        const alreadyFilteringUser = this.state.iconStyle !== undefined;
        if (alreadyFilteringUser) {
            this.state.iconStyle = undefined;
            this.state.iconTooltip = TOOLTIP_DEACTIVE;
            this.state.filter = this.state.filter.copyAndRemove(UserIDFilter.type);
            this.setState(this.state);
        } else {
            this.state.iconStyle = ACTIVE_ICON_STYLE;
            this.state.iconTooltip = TOOLTIP_ACTIVE;
            this.handleFilter(new UserIDFilter(convo.userId, true)); // This method will take care of setting state.
        }
    }

    handleLiveUpdate(enabled: boolean) {
        this.setState((prevState) => ({
            ...prevState,
            refreshOn: enabled,
            savedRefreshState: enabled,
        }));
    }

    handleVisiblityChange(state: VISIBLITY_STATE) {
        this.state.refreshOn = state === "visible" && this.state.savedRefreshState;
        this.setState(this.state);
    }

    render() {
        return (
            <VisibilityWatcher
                onChange={this.handleVisiblityChange} >
                <FilterBar
                    onFilterLogLevel={this.handleFilter}
                    onFilterRequest={this.handleFilter}
                    onFilterIntent={this.handleFilter}
                    onFilterException={this.handleFilter}
                    onFilterOrigin={this.handleFilter}
                    onFilterDate={this.handleDateFilter}
                    onLiveUpdate={this.handleLiveUpdate}
                    shouldRefresh={this.state && this.state.refreshOn}
                    dateRange={this.state.dateRange}
                    liveUpdateEnabled={this.state.refreshOn && !this.state.refreshDisabled}
                    disableLiveUpdateCheckbox={this.state.refreshDisabled} />
                <ConvoExplorerPage
                    onIconClick={this.handleIconClick}
                    iconStyle={this.state.iconStyle}
                    iconTooltip={this.state.iconTooltip}
                    refreshOn={this.state.refreshOn}
                    filter={this.state.filter} />
            </VisibilityWatcher>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConvoPage);

function isToday(date: Date) {
    return new Date().toDateString() === date.toDateString();
}
