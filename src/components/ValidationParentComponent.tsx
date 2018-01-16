import * as React from "react";
import {IconButton} from "react-toolbox";
import Checkbox from "react-toolbox/lib/checkbox";
import Dialog from "react-toolbox/lib/dialog";
import Input from "react-toolbox/lib/input";
import ProgressBar from "react-toolbox/lib/progress_bar";
import Snackbar from "react-toolbox/lib/snackbar";
import Tooltip from "react-toolbox/lib/tooltip";
import Button from "../components/Button";
import {Cell, Grid} from "../components/Grid";
import {Title} from "../components/Title";
import Source from "../models/source";

const dashboardTheme = require("../themes/dashboard.scss");
const inputTheme = require("../themes/input.scss");
const checkboxTheme = require("../themes/checkbox-theme.scss");
const buttonStyle = require("../themes/amazon_pane.scss");

export interface ValidationParentComponentProps {
    handleRun: (e: any) => void;
    source: Source;
    sources: any[];
    handleSelectedSource: (value: any) => void;
    handleTokenChange: (value: string) => void;
    handleSnackbarClick: () => any;
    handleVendorIDChange: (value: string) => void;
    token: string;
    showSnackbar: boolean;
    snackbarLabel: string;
    vendorID: string;
    script: string;
    scriptHint: any;
    handleScriptChange: (value: string) => void;
    handleHelpChange: (e: any) => void;
    showHelp: boolean;
    validationHelp: JSX.Element;
    loadingValidationResults: boolean;
    dialogActive: boolean;
    handleDialogToggle: () => any;
    validationResults: any;
    monitorEnabled: boolean;
    handleMonitorEnabledCheckChange: (value: boolean) => any;
}

interface ValidationParentComponentState {
}

const TooltipButton = Tooltip(IconButton);

export class ValidationParentComponent extends React.Component<ValidationParentComponentProps, ValidationParentComponentState> {

    constructor(props: ValidationParentComponentProps) {
        super(props);
        this.state = {
        };

    }

    render(): JSX.Element {
        return (
            <form onSubmit={this.props.handleRun}>
                <Cell col={12} tablet={12}>
                    <Grid>
                        <Cell col={9} tablet={8} phone={6}>
                            {
                                this.props && this.props.source && this.props.source.id &&
                                (
                                    <Title
                                        sources={this.props.sources}
                                        handleItemSelect={this.props.handleSelectedSource}
                                        selectedSourceId={this.props.source.id}/>
                                )
                            }
                        </Cell>
                        <Cell style={{position: "relative"}} col={3} hideTablet={true} hidePhone={true}>
                            <TooltipButton className={buttonStyle.info_button} icon={"info"} tooltip={"To retrieve your vendor ID go to https://developer.amazon.com/mycid.html Please make sure it is for the correct organization if you belong to multiple."} />
                            <div className={buttonStyle.enable_monitoring} >
                                <div>
                                    <span>ENABLE</span>
                                    <span>MONITORING</span>
                                </div>
                                <IconButton icon={"power_settings_new"} />
                            </div>
                            <Input theme={inputTheme} className={`sm-input ${inputTheme.validation_input}`} label="Validation Token" value={this.props.token}
                                   onChange={this.props.handleTokenChange} required={true}/>
                            <Snackbar className="sm-snackbar" action="Dismiss" type="cancel"
                                      active={this.props.showSnackbar}
                                      label={this.props.snackbarLabel}
                                      onClick={this.props.handleSnackbarClick}/>
                            <Input theme={inputTheme} className={`sm-input ${inputTheme.validation_input} ${inputTheme.vendor_input}`} label="Vendor ID" value={this.props.vendorID}
                                   onChange={this.props.handleVendorIDChange} required={true}/>
                        </Cell>
                    </Grid>
                </Cell>
                <Cell col={12}>
                    <Cell col={6}>
                        <Input className="script-input" multiline={true}
                               value={this.props.script}
                               onChange={this.props.handleScriptChange}
                               hint={this.props.scriptHint} required={true}/>
                        <p>Scripts will “speak” the sequence of commands listed above,
                            testing for the proper result - <a href="#" onClick={this.props.handleHelpChange}>click
                                here
                                for help</a>.
                        </p>
                    </Cell>
                </Cell>
                <Cell col={12}>
                    {this.props.showHelp ? this.props.validationHelp : undefined}
                </Cell>
                <Cell offset={10} col={2} style={{textAlign: "right"}}>
                    <Button className={buttonStyle.validation_button} primary={true} raised={true} disabled={this.props.loadingValidationResults}>
                        {this.props.loadingValidationResults
                            ?
                            <ProgressBar className="circularProgressBar" type="circular" mode="indeterminate"/>
                            : <span>Run Skill ></span>}
                    </Button>
                    <Dialog
                        className={`${dashboardTheme.dialog}`}
                        active={this.props.dialogActive}
                        onEscKeyDown={this.props.handleDialogToggle}
                        onOverlayClick={this.props.handleDialogToggle}>
                        <div dangerouslySetInnerHTML={{__html: this.props.validationResults}}/>
                    </Dialog>
                </Cell>
                <Cell style={{display: "none"}} col={12} className={`${inputTheme.checkbox}`}>
                    <Checkbox
                        theme={checkboxTheme}
                        label={"Enable Monitoring"}
                        checked={this.props.monitorEnabled}
                        onChange={this.props.handleMonitorEnabledCheckChange}/>
                </Cell>
            </form>
        );
    }
}

export default ValidationParentComponent;
