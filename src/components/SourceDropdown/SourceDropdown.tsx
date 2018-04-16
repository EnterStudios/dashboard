import * as React from "react";
import Dropdown from "react-toolbox/lib/dropdown";

const typeTheme = require("../../themes/type-dropdown.scss");

const sourceTypes = [
    {value: "alexa", label: "ALEXA SKILL"},
    {value: "google", label: "GOOGLE ACTION"},
    {value: "hybrid", label: "HYBRID SOURCE"},
];

interface SourceDropdownProps {
    handleTypeChange?: (value: string) => void;
    sourceType?: string;
    className?: string;
}

interface SourceDropdownState {
    value: string;
}

export default class SourceDropdown extends React.Component<SourceDropdownProps, SourceDropdownState> {
    constructor(props: any) {
        super(props);
    }

    handleTypeChange = (value: string) => {
        this.setState({value});
        this.props.handleTypeChange(value);
    }

    render() {
        return (
            <Dropdown
                className={this.props.className}
                theme={typeTheme}
                onChange={this.handleTypeChange}
                source={sourceTypes}
                value={this.props.sourceType} />
        );
    }
}
