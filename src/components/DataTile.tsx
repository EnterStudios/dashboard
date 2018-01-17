import * as React from "react";

import FormInput, { FormInputTheme } from "./FormInput";

interface DateTileProps {
    label: string;
    value: string;
    theme?: FormInputTheme;
    hidden?: boolean;
    showable?: boolean;
    smallWidth?: boolean;
    className?: string;
}

export class DataTile extends React.Component<DateTileProps, any> {
    render() {
        return (
            <FormInput
                className={this.props.className}
                theme={this.props.theme}
                type={this.props.hidden ? "password" : "text"}
                style={{paddingBottom: 0, width: this.props.smallWidth ? "75%" : "100%"}}
                value={this.props.value}
                label={this.props.label}
                floatingLabel={true}
                autoComplete={"off"}
                showable={this.props.showable}
                autoFocus={false}
                readOnly={true} />
        );
    }
}

export default DataTile;
