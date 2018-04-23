import * as React from "react";
import {IconButton} from "react-toolbox";
import Checkbox from "react-toolbox/lib/checkbox";
import Input from "react-toolbox/lib/input";
import ProgressBar from "react-toolbox/lib/progress_bar";
import Snackbar from "react-toolbox/lib/snackbar";
import Tooltip from "react-toolbox/lib/tooltip";
import Button from "../Button";
import {Cell, Grid} from "../Grid/index";
import {Title} from "../Title";
import EventHandler = __React.EventHandler;
import Source from "../../models/source";
import {UserDetails} from "../../models/user";
import auth from "../../services/auth";
import {remoteservice} from "../../services/remote-service";
import SourceService from "../../services/source";
import {ValidationResultComponent} from "./ValidationResultComponent";
import {ValidationTestComponent} from "./ValidationTestComponent";

const inputTheme = require("../../themes/input.scss");
const checkboxTheme = require("../../themes/checkbox-theme.scss");
const buttonStyle = require("../../themes/amazon_pane.scss");
const validationStyle = require("./ValidationParentComponentStyle.scss");

export interface ValidationParentComponentProps {
    handleRun: (e: any) => void;
    source: Source;
    sources: any[];
    getSources: () => Promise<Source[]>;
    setSource: (source: Source) => (dispatch: Redux.Dispatch<any>) => void;
    handleSelectedSource: (value: any) => void;
    handleTokenChange: (value: string) => void;
    handleGetTokenClick: EventHandler<any>;
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
    setLoading: (value: boolean) => (dispatch: Redux.Dispatch<any>) => void;
    handleShowSnackbarEnableMonitoring: () => any;
    handleShowSnackbarVerifyEmail: () => any;
    handleShowSnackbarScriptEmpty: () => any;
}

interface ValidationParentComponentState {
    enableValidation?: boolean;
    showMessage?: boolean;
}

const TooltipButton = Tooltip(IconButton);

export class ValidationParentComponent extends React.Component<ValidationParentComponentProps, ValidationParentComponentState> {

    constructor(props: ValidationParentComponentProps) {
        super(props);

        this.handleSaveScript = this.handleSaveScript.bind(this);
        this.updateSourceObject = this.updateSourceObject.bind(this);
        this.handleEnableValidation = this.handleEnableValidation.bind(this);

        this.state = {
            enableValidation: false,
            showMessage: false,
        };
    }

    componentWillReceiveProps(nextProps: ValidationParentComponentProps) {
        if (nextProps.source) {
            this.setState((prevState) => ({
                ...prevState,
                enableValidation: nextProps.source.validation_enabled,
            }));
        }
    }

    async componentDidMount () {
        const userDetails: UserDetails = await auth.currentUserDetails();
        if (userDetails && userDetails.smAPIAccessToken && !userDetails.vendorID) {
            this.props.setLoading(true);
            const vendorsId = await SourceService.getVendorIds(userDetails.smAPIAccessToken);
            // for now we default to the first vendorID, later we might add a way for the user to pick vendor id
            const vendorID = vendorsId && vendorsId.length && vendorsId[0].id;
            if (vendorID) {
                await auth.updateCurrentUser({ vendorID });
            }
            this.props.setLoading(false);
        }
    }

    async updateSourceObject (source: Source) {
        this.props.setLoading(true);
        await SourceService.updateSourceObj(source);
        const updatedSource = await SourceService.getSourceObj(this.props.source.id);
        await this.props.setSource(updatedSource);
        await this.props.getSources();
        this.setState((prevState) => ({
            showMessage: false,
            enableValidation: !prevState.enableValidation,
        }));
        this.props.setLoading(false);
    }

    async handleSaveScript () {
        try {
            const sourceToUpdate = {...this.props.source, validation_script: this.props.script};
            // update source with script on firebase
            await this.updateSourceObject(sourceToUpdate);
        } catch (err) {
            // TODO: return error to user if needed
            console.log(err);
        }
    }

    async handleEnableValidation () {
        // adding this to allow user to disable monitoring even if he doesn't have vendor or token
        // this.state.enableValidation means is already active so handleEnableValidation will disable it
        const emptyOrIncompleteScript = !this.props.script || this.props.script.indexOf("\"\": \"\"") >= 0 || this.props.script.indexOf(": \"\"") >= 0 || this.props.script.indexOf("\"\":") >= 0;
        if (this.state.enableValidation) {
            const validation_enabled = !this.state.enableValidation;
            const sourceToUpdate = {...this.props.source, validation_enabled, validation_script: this.props.script};
            await this.updateSourceObject(sourceToUpdate);
            return;
        }
        if (emptyOrIncompleteScript) {
            this.props.handleShowSnackbarScriptEmpty();
            return;
        }
        const user = remoteservice.defaultService().auth().currentUser;
        if (!user || !user.emailVerified) {
            this.props.handleShowSnackbarVerifyEmail();
            return;
        }
        if (this.props.token && this.props.vendorID) {
            const validation_enabled = !this.state.enableValidation;
            const sourceToUpdate = {...this.props.source, validation_enabled, validation_script: this.props.script};
            await this.updateSourceObject(sourceToUpdate);
        } else {
            this.props.handleShowSnackbarEnableMonitoring();
        }
    }

    handleCopyToClipBoard = () => {
        const textArea = document.createElement("textarea");
        textArea.value = this.props.token;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand("copy");
        } catch (err) {
            console.error("Oops, unable to copy", err);
        }
    }

    render() {
        const scriptIsNotSaved = this.props && this.props.source && (this.props.script !== this.props.source.validation_script);
        const validationEnabledStyle = this.state.enableValidation ? buttonStyle.enabled : "";
        const emptyOrIncompleteScript = !this.props.script || this.props.script.indexOf("\"\": \"\"") >= 0 || this.props.script.indexOf(": \"\"") >= 0 || this.props.script.indexOf("\"\":") >= 0;
        return (
            <form onSubmit={this.props.handleRun}>
                <Cell col={12} tablet={12}>
                    <Grid>
                        <Cell col={7} tablet={8} phone={6}>
                            {
                                this.props.source && this.props.source.id &&
                                (
                                    <Title
                                        sources={this.props.sources}
                                        selectedSourceId={this.props.source.id}
                                        handleUpdateSource={this.updateSourceObject}/>
                                )
                            }
                        </Cell>
                        <Cell style={{position: "relative"}} col={5} hideTablet={true} hidePhone={true}>
                            <TooltipButton className={buttonStyle.info_button} icon={"info"} tooltip={"Enable Monitoring and get notified instantly when there is a change in your validation results overtime."} />
                            <div className={`${buttonStyle.enable_monitoring} ${validationEnabledStyle}`} >
                                <div>
                                    <span>{this.state.enableValidation ? "DISABLE" : "ENABLE"}</span>
                                    <span>MONITORING</span>
                                </div>
                                <IconButton icon={"power_settings_new"} onClick={this.handleEnableValidation} />
                            </div>
                            <div className={validationStyle.token_container}>
                                <span>Validation Token:</span>
                                {
                                    (this.props && this.props.token &&
                                        (
                                            <div>
                                                <a className={validationStyle.refresh_token} href="#" onClick={this.props.handleGetTokenClick}>Refresh</a>
                                                <a className={validationStyle.copy_token} href="#" onClick={this.handleCopyToClipBoard} title={"copy"}>
                                                    <svg fill="#75bfca" height="24" viewBox="0 0 24 24" width="24"
                                                         xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M0 0h24v24H0z" fill="none"/>
                                                        <path
                                                            d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                                    </svg>
                                                </a>
                                                <Input theme={inputTheme}
                                                       className={`sm-input ${inputTheme.validation_input} ${validationStyle.token_input}`}
                                                       label="Validation Token" value={this.props.token}
                                                       onChange={this.props.handleTokenChange} required={true}/>
                                            </div>
                                        )
                                    ) ||
                                    <a className={`${validationStyle.get_token}`} href="#" onClick={this.props.handleGetTokenClick}>Get validation token</a>
                                }
                            </div>
                            <Snackbar className="sm-snackbar" action="Dismiss" type="cancel"
                                      active={this.props.showSnackbar}
                                      label={this.props.snackbarLabel}
                                      onClick={this.props.handleSnackbarClick}/>
                        </Cell>
                    </Grid>
                </Cell>
                <Cell className={validationStyle.main_container} col={12}>
                    <ValidationTestComponent script={this.props.script || ""} handleScriptChange={this.props.handleScriptChange} />
                    <ValidationResultComponent unparsedHtml={this.props.validationResults} />
                </Cell>
                <Cell col={12}>
                    {this.props.showHelp ? this.props.validationHelp : undefined}
                </Cell>
                <Cell className={`${validationStyle.button_container} ${validationStyle.left}`} col={2}>
                    <Button type="button" onClick={this.handleSaveScript} className={buttonStyle.validation_button} primary={true} raised={true} disabled={!scriptIsNotSaved}>
                        <span>Save script</span>
                    </Button>
                </Cell>
                <Cell className={`${validationStyle.button_container} ${validationStyle.right}`} offset={8} col={2}>
                    <Button className={buttonStyle.validation_button} primary={true} raised={true} disabled={this.props.loadingValidationResults || !this.props.token || emptyOrIncompleteScript}>
                        {this.props.loadingValidationResults
                            ?
                            <ProgressBar className="circularProgressBar" type="circular" mode="indeterminate"/>
                            : <span>Run Skill ></span>}
                    </Button>
                </Cell>
                <Cell col={12}>
                    {
                        this.state.showMessage &&
                        <span className={validationStyle.validation_text}>Your script is not updated with the last changes you've made, make sure you save your script so the monitoring gets the latest changes</span>
                    }
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
