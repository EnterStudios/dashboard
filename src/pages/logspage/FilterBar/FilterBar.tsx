import * as classNames from "classnames";
import { Moment } from "moment";
import * as React from "react";
import { Button } from "react-toolbox/lib/button";
import Checkbox from "react-toolbox/lib/checkbox";
import DatePicker from "react-toolbox/lib/date_picker";
import Dropdown from "react-toolbox/lib/dropdown";
import Input from "react-toolbox/lib/input";
import { Cell, Grid } from "../../../components/Grid";
import { Origin } from "../../../models/conversation";
import { DateFilter, ExceptionFilter, IntentFilter, LogLevelFilter, OriginFilter, RequestFilter } from "../filters/ConvoFilters";
import "./small-button";

const FilterBarStyle = require("./style.scss");
const DatePickerFilterbarTheme = require("../../../themes/datepicker-filterbar.scss");
const DropdownFilterbarTheme = require("../../../themes/dropdown-filterbar.scss");
const InputTheme = require("../../../themes/input-light.scss");
const CheckboxTheme = require("../../../themes/checkbox-theme-light.scss");
const ButtonTheme = require("../../../themes/button_theme.scss");

export interface DateRange {
    startTime?: Date | Moment;
    endTime?: Date | Moment;
}

export interface FilterProps {
    // query: LogQuery;
    dateRange: DateRange;
    liveUpdateEnabled: boolean;
    onFilterLogLevel: (filter: LogLevelFilter) => void;
    onFilterRequest: (filter: RequestFilter) => void;
    onFilterIntent: (filter: IntentFilter) => void;
    onFilterDate: (filter: DateFilter) => void;
    onFilterException: (filter: ExceptionFilter) => void;
    onFilterOrigin: (filter: OriginFilter) => void;
    onLiveUpdate: (enabled: boolean) => void;
    disableLiveUpdateCheckbox?: boolean;
    className?: string;
    shouldRefresh?: boolean;
}

export interface FilterState {
    startDate?: Date;
    endDate?: Date;
    logTypes?: LogType[];
    origins?: LogType[];
    selectedType?: string;
    selectedOrigin?: string;
    requestValue?: string;
    intentValue?: string;
    exceptionsOnly?: boolean;
    filterMap: any;
    filterbarHidden: boolean;
}

interface LogType {
    value: string;
    label: string;
}

function convertDate(date: Date | Moment): Date {
    if (date) {
        if (date instanceof Date) {
            return date;
        } else {
            return date.toDate();
        }
    }
    return undefined;
}

class FilterBar extends React.Component<FilterProps, FilterState> {

    handleStartDateChange: Function;
    handleEndDateChange: Function;

    constructor(props: FilterProps) {
        super(props);

        let types: LogType[] = [];
        types.push({ value: "", label: "Any" });
        types.push({ value: "DEBUG", label: "Debug" });
        types.push({ value: "INFO", label: "Info" });
        types.push({ value: "WARN", label: "Warning" });
        types.push({ value: "ERROR", label: "Error" });

        let origins: LogType[] = [];
        origins.push({ value: "", label: "Any" });
        origins.push({ value: "Alexa", label: "Alexa" });
        origins.push({ value: "Home", label: "Home" });

        this.state = {
            filterMap: {},
            selectedType: types[0].value,
            selectedOrigin: origins[0].value,
            logTypes: types,
            origins: origins,
            filterbarHidden: false,
            startDate: convertDate(props.dateRange.startTime),
            endDate: convertDate(props.dateRange.endTime),
    };

        this.handleStartDateChange = this.handleDateChange.bind(this, "startDate");
        this.handleEndDateChange = this.handleDateChange.bind(this, "endDate");
        this.handleExceptionOnlyChange = this.handleExceptionOnlyChange.bind(this);
        this.handleLogTypeChange = this.handleLogTypeChange.bind(this);
        this.handleIntentChange = this.handleIntentChange.bind(this);
        this.handleRequestChange = this.handleRequestChange.bind(this);
        this.handleOriginChange = this.handleOriginChange.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
    }

    gridClasses() {
        return classNames(FilterBarStyle.filterBarGrid, this.props.className);
    }

    componentWillReceiveProps(nextProps: FilterProps) {
        // currently not letting the caller override state if it changed.
        // TODO: It would be preferable to allow this or get rid of query.
        this.setDateRange(nextProps.dateRange.startTime, nextProps.dateRange.endTime);
    }

    setDateRange(startDate: Date | Moment, endDate: Date | Moment) {
        this.state.startDate = convertDate(startDate);
        if (this.state.startDate) {
            this.state.startDate.setHours(0, 0, 0, 0);
        }

        this.state.endDate = convertDate(endDate);
        if (this.state.endDate) {
            this.state.endDate.setHours(23, 59, 59, 999);
        }
        this.setState(this.state);
    }

    handleDateChange(item: "startDate" | "endDate", value: Date) {
        if (item === "startDate") {
            this.setDateRange(value, this.state.endDate);
        } else if (item === "endDate") {
            this.setDateRange(this.state.startDate, value);
        }

        this.props.onFilterDate(new DateFilter(this.state.startDate, this.state.endDate));
    }

    handleLogTypeChange(value: string) {
        this.state.selectedType = value;
        this.setState(this.state);
        this.props.onFilterLogLevel(new LogLevelFilter(value));
    }

    handleRequestChange(value: string) {
        this.state.requestValue = value;
        this.setState(this.state);
        this.props.onFilterRequest(new RequestFilter(value));
    }

    handleIntentChange(value: string) {
        this.state.intentValue = value;
        this.setState(this.state);
        this.props.onFilterIntent(new IntentFilter(value));
    }

    handleExceptionOnlyChange(value: boolean) {
        this.state.exceptionsOnly = value;
        this.setState(this.state);

        let filter: ExceptionFilter = (value) ? new ExceptionFilter() : new FakeExceptionFilter();
        this.props.onFilterException(filter);
    }

    handleOriginChange(value: string) {
        this.state.selectedOrigin = value;
        this.setState(this.state);

        let origin: Origin;
        switch (value) {
            case "Alexa":
                origin = Origin.AmazonAlexa;
                break;
            case "Home":
                origin = Origin.GoogleHome;
                break;
            default:
                origin = undefined;
        }
        let filter: OriginFilter = new OriginFilter(origin);
        this.props.onFilterOrigin(filter);
    }

    async handleRefresh() {
        await this.props.onLiveUpdate(!this.props.shouldRefresh);
    }

    render(): JSX.Element {
        let fullEndDate = new Date();
        let queryEndDate = this.state.endDate ? this.state.endDate : fullEndDate;

        return (
            <Grid className={this.gridClasses()} >
                <Cell col={1} tablet={1} phone={1}>
                    <Dropdown
                        theme={DropdownFilterbarTheme}
                        label="Origin"
                        auto={false}
                        onChange={this.handleOriginChange}
                        source={this.state.origins}
                        value={this.state.selectedOrigin}
                    />
                </Cell>
                <Cell col={1} tablet={1} phone={1}>
                    <Dropdown
                        theme={DropdownFilterbarTheme}
                        label="Log Level"
                        auto={false}
                        onChange={this.handleLogTypeChange}
                        source={this.state.logTypes}
                        value={this.state.selectedType}
                    />
                </Cell>
                <Cell col={1} offsetDesktop={1} tablet={2} offsetTablet={2} phone={1} offsetPhone={0} >
                    <Input
                        theme={InputTheme}
                        type="text"
                        label="Request"
                        name="Request"
                        value={this.state.requestValue}
                        onChange={this.handleRequestChange} />
                </Cell>
                <p style={{ color: "rgb(255, 255, 255)", fontSize: "26px", margin: "auto -5px", marginTop: "28px", display: "inline-block" }}>.</p>
                <Cell col={1} offsetDesktop={0} tablet={2} offsetTablet={0} phone={1} offsetPhone={0} >
                    <Input
                        theme={InputTheme}
                        type="text"
                        label="Intent"
                        name="Intent"
                        value={this.state.intentValue}
                        onChange={this.handleIntentChange} />
                </Cell>
                <Cell col={1} offsetDesktop={1} tablet={1} offsetTablet={0} phone={1} offsetPhone={0}>
                    <div style={{ position: "relative", top: "50%", transform: "translate(0%, -50%)" }} >
                        <Checkbox
                            theme={CheckboxTheme}
                            checked={this.state.exceptionsOnly}
                            label="With Exceptions"
                            onChange={this.handleExceptionOnlyChange} />
                    </div>
                </Cell>
                <Cell col={2} offsetDesktop={1} tablet={2} offsetTablet={3} phone={1} offsetPhone={1}>
                    <DatePicker
                        autoOk
                        theme={DatePickerFilterbarTheme}
                        label="Start Date"
                        maxDate={queryEndDate}
                        value={this.state.startDate}
                        onChange={this.handleStartDateChange}
                        readonly={this.props.dateRange ? false : true} />
                </Cell>
                <p style={{ color: "rgb(255, 255, 255)", fontSize: "26px", margin: "auto -5px", marginTop: "28px", display: "inline-block" }}>-</p>
                <Cell col={2} offsetDesktop={0} tablet={2} offsetTablet={0} phone={1} offsetPhone={0}>
                    <DatePicker
                        autoOk
                        theme={DatePickerFilterbarTheme}
                        label="End Date"
                        minDate={this.state.startDate}
                        maxDate={fullEndDate}
                        value={this.state.endDate}
                        onChange={this.handleEndDateChange}
                        readonly={this.props.dateRange ? false : true} />
                </Cell>
                <Cell col={3} tablet={5} phone={4}>
                    <Checkbox
                        theme={CheckboxTheme}
                        style={{opacity: 0, marginLeft: "-25px"}}
                        label="Refresh"
                        checked={this.props.liveUpdateEnabled}
                        disabled={this.props.disableLiveUpdateCheckbox}
                        onChange={this.props.onLiveUpdate} />
                    <Button className="small-button" theme={ButtonTheme} onClick={this.handleRefresh} icon="refresh" accent={true} mini={true} floating={true}/>
                </Cell>
            </Grid>
        );
    }
}

export default FilterBar;

class FakeExceptionFilter extends ExceptionFilter {

    get filter(): (item: any) => boolean {
        return function (item: any): boolean {
            return true;
        };
    }
}
