import * as React from "react";
import {IconButton} from "react-toolbox";
import Input from "react-toolbox/lib/input";

const iconButtonTheme = require("../../themes/icon-button-validation.scss");
const inputTheme = require("../../themes/input.scss");
const validationStyle = require("./ValidationTestComponentStyle.scss");

interface TestRow {
    input: string;
    expected: string;
    id: number;
}

export interface ValidationTestComponentProps {
    script?: string;
    handleScriptChange?: (value: string) => void;
}

interface ValidationTestComponentState {
    testRows: TestRow[];
}

export class ValidationTestComponent extends React.Component<ValidationTestComponentProps, ValidationTestComponentState> {

    constructor(props: ValidationTestComponentProps) {
        super(props);
        this.state = {
            testRows: [],
        };

        this.buildRows = this.buildRows.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleExpectedChange = this.handleExpectedChange.bind(this);
        this.handleAddRow = this.handleAddRow.bind(this);
        this.handleRemoveRow = this.handleRemoveRow.bind(this);
        this.updateTestScript = this.updateTestScript.bind(this);
    }

    componentDidMount () {
        if (this.props.script && this.props.script.length) {
            const rows = this.props.script.split(/\r?\n/);
            if (rows && rows.length) {
                const testRows = rows.map((row, index) => {
                    const stripedRow = row.replace(/"/g, "");
                    const [input, expected] = stripedRow.split(/: /);
                    return {input, expected, id: index};
                });
                this.setState(() => ({
                    testRows: testRows,
                }));
            }
        } else {
            this.setState(() => ({
                testRows: [{input: "", expected: "", id: 0}],
            }));
        }
    }

    componentDidUpdate (prevProps: ValidationTestComponentProps, prevState: ValidationTestComponentState) {
        if (this.props.script &&
            this.props.script.length &&
            (prevProps.script !== this.props.script) &&
            (this.state.testRows.length === 1 && this.state.testRows[0].input === "" && this.state.testRows[0].expected === "")) {
            this.buildRows(this.props.script);
        }
    }

    componentWillReceiveProps (nextProps: ValidationTestComponentProps) {
        if (this.props.script !== nextProps.script) {
            this.buildRows(nextProps.script);
        }
    }

    buildRows (script: string) {
        const rows = script.split(/\r?\n/);
        if (rows && rows.length) {
            const testRows = rows.map((row, index) => {
                const stripedRow = row.replace(/"/g, "");
                const [input, expected] = stripedRow.split(/: /);
                return {input: input || "", expected: expected || "", id: index};
            });
            this.setState(() => ({
                testRows: testRows,
            }));
        }
    }

    updateTestScript (updatedRows: TestRow[]) {
        const updatedStringsArray = updatedRows.map(row => `"${row.input}": "${row.expected}"`);
        const updatedScript = updatedStringsArray.join("\n");
        this.props.handleScriptChange(updatedScript);
    }

    handleInputChange (value: string, event: any) {
        const index = Number(event.target.name.replace("input", ""));
        this.setState((prevState) => {
            const {testRows} = this.state;
            const updatedRows = testRows.map(row => {
                if (row.id === index) {
                    return {...row, input: value};
                }
                return row;
            });
            this.updateTestScript(updatedRows);
            return {
                testRows: updatedRows
            };
        });
    }

    handleExpectedChange (value: string, event: any) {
        const index = Number(event.target.name.replace("expected", ""));
        this.setState((prevState) => {
            const {testRows} = prevState;
            const updatedRows = testRows.map(row => {
                if (row.id === index) {
                    return {...row, expected: value};
                }
                return row;
            });
            this.updateTestScript(updatedRows);
            return {
                testRows: updatedRows,
            };
        });
    }

    handleAddRow () {
        this.setState((prevState) => {
            const {testRows} = prevState;
            const lastIndex = testRows[testRows.length - 1].id + 1;
            testRows.push({input: "", expected: "", id: lastIndex});
            return {
                testRows
            };
        });
    }

    handleRemoveRow (index: any) {
        this.setState((prevState) => {
            const {testRows} = prevState;
            const updatedRows = testRows.filter(row => row.id !== index).map((row, index) => ({...row, id: index}));
            this.updateTestScript(updatedRows);
            return {
                testRows: updatedRows,
            };
        });
    }

    render() {
        return (
            <div className={validationStyle.container}>
                <div>
                    <div className={validationStyle.title}>
                        <span>
                            Input
                        </span>
                        <span className={validationStyle.secondary_text}>
                            (your question to the device)
                        </span>
                    </div>
                    <div className={`${validationStyle.title} ${validationStyle.second_item}`}>
                        <span>
                            Expected
                        </span>
                        <span className={validationStyle.secondary_text}>
                            (your expected answer from the device)
                        </span>
                    </div>
                </div>
                {
                    this.state.testRows && this.state.testRows.map((row, index) => {
                        return (
                            <div className={validationStyle.validation_test_row} key={`parent_div${index}`}>
                                <div>
                                    {index !== 0 && <RemoveButton index={index} handleRemoveRow={this.handleRemoveRow} />}
                                </div>
                                <div className={validationStyle.first_input} key={`child_div1${index}`}>
                                    <Input name={`input${index}`} onChange={this.handleInputChange} className={inputTheme.validation_test_component} theme={inputTheme} key={`input${index}`} value={row.input} />
                                </div>
                                <div className={validationStyle.second_input} key={`child_div2${index}`}>
                                    <Input name={`expected${index}`} onChange={this.handleExpectedChange} className={inputTheme.validation_test_component} theme={inputTheme} key={`expected${index}`} value={row.expected}/>
                                </div>
                            </div>
                        );
                    })
                }
                <div className={validationStyle.add_button_container}>
                    <IconButton onClick={this.handleAddRow} primary={true} theme={iconButtonTheme} icon={"add"} /><span className={validationStyle.add_row_text}>Add Row</span>
                </div>
            </div>
        );
    }
}

export class RemoveButton extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    render() {
        const { index, handleRemoveRow } = this.props;
        const removeRow = () => handleRemoveRow(index);
        return (
            <div>
                <IconButton className={iconButtonTheme.remove_row} onClick={removeRow} primary={true} theme={iconButtonTheme} icon={"remove"} />
            </div>
        );
    }
}

export default ValidationTestComponent;
