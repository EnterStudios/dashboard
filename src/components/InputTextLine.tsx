import * as classNames from "classnames";
import * as React from "react";
import Input from "react-toolbox/lib/input";

const InputTextLineStyle = require("../themes/InputTextLine.scss");


interface InputProps {
    theme?: string;
    value?: string;
    defaultValue?: string;
    label?: string;
    onValueChange?: (newValue: string) => void;
    leftText: string;
    rightText: string;
    disabled?: boolean;
}

export class InputTextLine extends React.Component<InputProps, any> {
    static defaultProps: InputProps = {
        value: "",
        leftText: "",
        rightText: "",
    };

    render() {
        const { value, onValueChange, label, leftText, rightText, theme, disabled, ...others } = this.props;
        return (
            <div className={classNames(InputTextLineStyle.textLineBlock)}>
                <p>{leftText}</p>
                    <Input {...others} theme={InputTextLineStyle} label={label} value={value} onChange={onValueChange}/>
                <p>{rightText}</p>
            </div>
        );
    }
}

export default InputTextLine;
