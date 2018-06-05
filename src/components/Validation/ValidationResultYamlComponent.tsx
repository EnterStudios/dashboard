import * as React from "react";
import {IconButton} from "react-toolbox";

const iconButtonTheme = require("../../themes/icon-button-validation.scss");
const validationStyle = require("./ValidationResultYamlComponentStyle.scss");

interface ResultSequence {
    status: string;
    icon: string;
    resultRows: ResultRow[];
}

interface ResultRow {
    icon: string;
    status: string;
    input: string;
    expected: string;
    actual: string;
}

export interface ValidationResultYamlComponentProps {
    unparsedHtml?: string;
}

interface ValidationResultYamlComponentState {
    resultSequences: ResultSequence[];
}

export class ValidationResultYamlComponent extends React.Component<ValidationResultYamlComponentProps, ValidationResultYamlComponentState> {

    constructor(props: ValidationResultYamlComponentProps) {
        super(props);
        this.state = {
            resultSequences: [],
        };
    }

    componentWillReceiveProps(nextProps: ValidationResultYamlComponentProps) {
        const parsedHtml = new DOMParser().parseFromString(nextProps.unparsedHtml, "text/html");
        const sequences = parsedHtml.documentElement.getElementsByClassName("sequence");
        const resultSequences: ResultSequence[] = [];
        for (let i = 0; i < sequences.length; i++) {
            const rows = sequences[i].getElementsByTagName("tr");
            const resultRows: ResultRow[] = [];
            if (rows && rows.length > 1) {
                for (let j = 1; j < rows.length; j++) {
                    const row = rows[j];
                    // adding some hardcoded selections and strip downs until sourceAPI code is change
                    const icon: string = row.cells[0].innerHTML.indexOf("/assets/Schedule.svg") > -1 ?
                        "/assets/Schedule.svg" :
                        row.cells[0].innerHTML.indexOf("/assets/Spinner.svg") > -1 ?
                            "/assets/Spinner.svg" :
                            row.cells[0].innerHTML;
                    const input: string = row.cells[1].innerHTML;
                    const expected: string = row.cells[2].innerHTML;
                    const actual: string = row.cells[3].innerHTML;
                    const status: string = row.cells[0].innerHTML.indexOf("✔") > -1 ?
                        "success" :
                        row.cells[0].innerHTML.indexOf("✘") > -1 ?
                            "error" :
                            "";
                    resultRows.push({icon, status, input, expected, actual});
                }
                const status = resultRows.some(row => row.status === "error") ? "error" : "success";
                const icon = resultRows.every(row => row.icon === "/assets/Schedule.svg") ?
                    "/assets/Schedule.svg" :
                    resultRows.some(row => row.icon === "/assets/Spinner.svg") ?
                        "/assets/Spinner.svg" :
                        "";
                resultSequences.push({resultRows, status, icon});
            }
        }
        this.setState(() => ({
            resultSequences,
        }));
    }

    render() {
        return (
            <div className={validationStyle.container}>
                <div className={validationStyle.scrollable}>
                    {
                        this.state.resultSequences && this.state.resultSequences.map((sequence, index) => {
                            const loadingIconClass = sequence.icon &&
                            sequence.icon.indexOf("/assets/Schedule.svg") > -1 ?
                                validationStyle.clock :
                                sequence.icon && sequence.icon.indexOf("/assets/Spinner.svg") > -1 ?
                                    validationStyle.spinner :
                                    "";
                            return (
                                <div className={validationStyle.sequence_container} key={`parent_sequence_div${index}`}>
                                <span className={validationStyle.sequence_title}>sequence {index + 1}
                                    {sequence.icon && <img className={`${validationStyle.loading_status} ${loadingIconClass}`} src={sequence.icon} alt={"img-status"}/>}
                                    {!sequence.icon && <IconButton className={`${iconButtonTheme[sequence.status]} ${iconButtonTheme.yaml_button}`} primary={true} theme={iconButtonTheme} icon={sequence.status === "success" ? "✔" : "✘"}/>}
                                </span>
                                    {
                                        sequence.resultRows.map((row, index) =>
                                            (
                                                <div className={`${validationStyle.validation_result_row}`} key={`parent_row_div${index}`}>
                                                    <div>
                                                        {row.status && <span className={`${validationStyle.row_icon_status} ${validationStyle[row.status]}`}>{row.icon}</span>}
                                                        <span>Input</span>
                                                        <span className={validationStyle.yaml_result}>{row.input}</span>
                                                    </div>
                                                    <div>
                                                        <span>Expected</span>
                                                        <span className={validationStyle.yaml_result}>{row.expected}</span>
                                                    </div>
                                                    <div>
                                                        <span>Actual</span>
                                                        <span className={validationStyle.yaml_result}>{row.actual}</span>
                                                    </div>
                                                </div>
                                            )
                                        )
                                    }
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}

export default ValidationResultYamlComponent;
