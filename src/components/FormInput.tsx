import * as classNames from "classnames";
import * as React from "react";

import { COLORS } from "../constants";
import "../themes/custom-input";
import StringUtil from "../utils/string";
import MDLComponent from "./MDLComponent";
import Pill from "./Pill";

/**
 * Class that can be included to display custom messages to the user based on the input.
 */
export interface ErrorHandler {
    /**
     * The regex to set to the form to check against.  An undefined means that any text will be accepted.
     */
    regex: RegExp;
    /**
     * If the input doesn't match the input prodided, this method will be called to retrieve the error message to display to the user.
     *
     * @param input
     *      The input that the user has shown.
     *
     */
    errorMessage: (input: string) => string | undefined;
}

export interface FormInputTheme {
    inputTextColor: string;
    bottomBorderColor?: string;
};

interface FormInputProps {
    theme?: FormInputTheme;
    label: string;
    type: "text" | "password";
    value: string;
    autoFocus?: boolean;
    floatingLabel?: boolean;
    onChange?: (event: React.FormEvent) => any;
    style?: React.CSSProperties;
    readOnly?: boolean;
    autoComplete?: "off" | "on";
    hidden?: boolean;
    error?: ErrorHandler;
    showable?: boolean;
    className?: string;
}

interface FormState {
    errorMsg?: string;
    show: boolean;
}

export class FormInput extends MDLComponent<FormInputProps, FormState> {

    constructor(props: FormInputProps) {
        super(props);
        this.state = {
            errorMsg: undefined,
            show: false
        };

        this.onShow = this.onShow.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
    }

    classes() {
        return classNames("mdl-textfield mdl-js-textfield", this.props.className, {
            "mdl-textfield--floating-label": this.props.floatingLabel
        });
    }

    inputStyle(): React.CSSProperties {
        if (!this.props.theme) {
            return undefined;
        }

        const theme = this.props.theme;
        let style = {};

        if (theme.inputTextColor) {
            style = {...style, ... { color: theme.inputTextColor }};
        }

        if (theme.bottomBorderColor) {
            style = {...style, ... { borderBottomColor: theme.bottomBorderColor }};
        }

        return style;
    }

    onFormChange(event: React.FormEvent) {
        let errorMsg: string = undefined;
        let target = event.target as HTMLSelectElement;
        if (this.props.error !== undefined) {
            errorMsg = this.props.error.errorMessage(target.value);
        }

        this.state.errorMsg = errorMsg;
        this.setState(this.state);

        if (this.props.onChange) {
            this.props.onChange(event);
        }
    }

    onShow(event: React.MouseEvent) {
        this.setState(function (previousState) {
            return {
                errorMsg: previousState.errorMsg,
                show: !previousState.show
            };
        });
    }

    render() {
        let pattern: string = undefined;
        if (this.props.error !== undefined) {
            pattern = this.props.error.regex.source;
        }

        let pill: JSX.Element;

        if (this.props.showable) {
            let pillText = this.state.show ? "hide" : "show";
            let pillColor = this.state.show ? COLORS.GREEN : COLORS.RED;

            pill = (
                <Pill onClick={this.onShow}
                    style={{
                        backgroundColor: pillColor,
                        position: "absolute",
                        right: "0px",
                        top: "0px",
                        padding: "2px",
                        lineHeight: "12px",
                        cursor: "pointer"
                    }}>
                    {pillText}
                </Pill>
            );
        }

        let autoFocus: boolean = this.props.autoFocus || false;
        return (
            <div
                className={this.classes()}
                style={this.props.style}
                hidden={this.props.hidden}>
                <input
                    autoFocus={autoFocus}
                    autoComplete={this.props.autoComplete ? this.props.autoComplete : "off"}
                    className="mdl-textfield__input"
                    type={this.state.show ? "text" : this.props.type}
                    id={StringUtil.stringToCamelCase(this.props.label)}
                    value={this.props.value}
                    pattern={pattern}
                    onChange={this.onFormChange}
                    readOnly={this.props.readOnly}
                    style={this.inputStyle()} />
                {pill}
                <label
                    className="mdl-textfield__label custom"
                    htmlFor={StringUtil.stringToCamelCase(this.props.label)}>
                    {this.props.label}
                </label>
                <span className="mdl-textfield__error">{this.state.errorMsg}</span>
            </div>
        );
    }
}

export default FormInput;
