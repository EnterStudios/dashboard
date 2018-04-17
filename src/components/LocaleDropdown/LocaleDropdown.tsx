import * as React from "react";
import Dropdown from "react-toolbox/lib/dropdown";

const localeTheme = require("../../themes/locale-dropdown.scss");
const localeDropdownStyle = require("./LocaleDropdownStyle.scss");

const localeTypes = [
    {value: "de-DE", label: "German", img: "https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Flag_of_Germany.svg/1280px-Flag_of_Germany.svg.png"},
    {value: "en-AU", label: "English (Australia)", img: "https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg"},
    {value: "en-CA", label: "English (Canada)", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/1200px-Flag_of_Canada_%28Pantone%29.svg.png"},
    {value: "en-GB", label: "English (UK)", img: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Flag_of_the_United_Kingdom.svg/1280px-Flag_of_the_United_Kingdom.svg.png"},
    {value: "en-IN", label: "English (India)", img: "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png"},
    {value: "en-US", label: "English (US)", img: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/1280px-Flag_of_the_United_States.svg.png"},
    {value: "fr-FR", label: "French", img: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Flag_of_France.svg/255px-Flag_of_France.svg.png"},
    {value: "ja-JP", label: "Japanese", img: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Flag_of_Japan.svg/1280px-Flag_of_Japan.svg.png"},
];

interface LocaleDropdownProps {
    handleLocaleChange?: (value: string) => void;
    locale?: string;
    className?: string;
}

interface LocaleDropdownState {
    value: string;
}

export default class LocaleDropdown extends React.Component<LocaleDropdownProps, LocaleDropdownState> {
    constructor(props: any) {
        super(props);
    }

    handleTypeChange = (value: string) => {
        this.setState({value});
        this.props.handleLocaleChange(value);
    }

    customDropdownItem = (data: any) => {
        return (
            <div className={localeDropdownStyle.item}>
                <img src={data.img || ""} />
                <div className={localeDropdownStyle.content}>
                    <strong>{data.label}</strong>
                </div>
            </div>
        );
    }

    render() {
        return (
            <Dropdown
                className={this.props.className}
                theme={localeTheme}
                onChange={this.handleTypeChange}
                source={localeTypes}
                template={this.customDropdownItem}
                value={this.props.locale} />
        );
    }
}
