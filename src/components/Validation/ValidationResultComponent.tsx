import * as React from "react";
import {IconButton} from "react-toolbox";

const iconButtonTheme = require("../../themes/icon-button-validation.scss");
const validationStyle = require("./ValidationResultComponentStyle.scss");

interface ResultRow {
    icon: string;
    text: string;
    status: string;
}

export interface ValidationResultComponentProps {
    unparsedHtml?: string;
}

interface ValidationResultComponentState {
    resultRows: ResultRow[];
}

export class ValidationResultComponent extends React.Component<ValidationResultComponentProps, ValidationResultComponentState> {

    constructor(props: ValidationResultComponentProps) {
        super(props);
        this.state = {
            resultRows: [],
        };
    }

    componentWillReceiveProps (nextProps: ValidationResultComponentProps) {
        const parsedHtml = new DOMParser().parseFromString(nextProps.unparsedHtml, "text/html");
        const rows = parsedHtml.documentElement.getElementsByTagName("tr");
        const resultRows: ResultRow[] = [];
        if (rows && rows.length > 1) {
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                // adding some hardcoded selections and strip downs until sourceAPI code is change
                const icon: string = row.cells[0].innerHTML.indexOf("/assets/Schedule.svg") > -1 ?
                    "/assets/Schedule.svg" :
                    row.cells[0].innerHTML.indexOf("/assets/Spinner.svg") > -1 ?
                    "/assets/Spinner.svg" :
                    row.cells[0].innerHTML;
                const text: string = row.cells[3].innerHTML;
                const status: string = row.cells[0].innerHTML.indexOf("✔") > -1 ?
                    "success" :
                    row.cells[0].innerHTML.indexOf("✘") > -1 ?
                    "error" :
                    "";
                resultRows.push({icon, text, status});
            }
            this.setState(() => ({
                resultRows,
            }));
        }
    }

    render() {
        return (
            <div className={validationStyle.container}>
                <div>
                    <div className={validationStyle.title}>
                        <span>
                            Actual
                        </span>
                        <span className={validationStyle.secondary_text}>
                            (the actual device response)
                        </span>
                    </div>
                </div>
                {
                    this.state.resultRows && this.state.resultRows.map((row, index) => {
                        return (
                            <div className={`${validationStyle.validation_result_row}`} key={`parent_div${index}`}>
                                {
                                    (row.status !== "") ?
                                        (
                                            <div key={`child_div1${index}`}>
                                                <IconButton className={iconButtonTheme[`${row.status}`]} primary={true}
                                                            theme={iconButtonTheme}
                                                            icon={row.icon}/><span className={`${validationStyle.result_text} ${validationStyle[`${row.status}`]}`}>{row.text}</span>
                                            </div>
                                        ) :
                                        (
                                            <div className={validationStyle.align_center} key={`child_div1${index}`}>
                                                <img src={row.icon} alt={"img-status"} />
                                            </div>
                                        )
                                }
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

export default ValidationResultComponent;
