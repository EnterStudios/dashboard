import * as React from "react";
import {IconButton} from "react-toolbox";
import Dialog from "react-toolbox/lib/dialog";
import Source from "../../models/source";
import MonitoringService from "../../services/monitoring";
import SourceService from "../../services/source";

const SourceSelectorItemStyle = require("./SourceSelectorItemStyle.scss");

const DeleteDialogTheme = require("../../themes/dialog_theme.scss");

interface SourceSelectorItemProps {
    source: Source;
    getSources: () => Promise<Source[]>;
    goTo: (path: string) => (dispatch: Redux.Dispatch<any>) => void;
    onClick: any;
    removeSource: (source: Source) => void;
    handleLoadingChange: (value: boolean) => void;
    active: boolean;
}

interface SourceSelectorItemState {
    enableValidation: boolean;
    loading?: boolean;
    deleteDialogActive: boolean;
    isSourceUp?: boolean;
    sourceType: string;
}

export default class SourceSelectorItem extends React.Component<SourceSelectorItemProps, SourceSelectorItemState> {
    dialogActions: any[];
    constructor(props: SourceSelectorItemProps) {
        super(props);

        this.dialogActions = [{
            label: "Cancel",
            onClick: this.handleDeleteDialogToggle.bind(this),
        }, {
            label: "Delete",
            onClick: this.handleDeleteSource.bind(this),
        }];

        this.state = {
            enableValidation: props.source.validation_enabled,
            loading: false,
            deleteDialogActive: false,
            isSourceUp: true,
            sourceType: "ALEXA SKILL"
        };

        this.handleItemClick = this.handleItemClick.bind(this);
        this.handleDeleteSource = this.handleDeleteSource.bind(this);
        this.updateSourceObject = this.updateSourceObject.bind(this);
        this.handleItemDoubleClick = this.handleItemDoubleClick.bind(this);
        this.handleSourceNameChange = this.handleSourceNameChange.bind(this);
        this.handleEnableValidation = this.handleEnableValidation.bind(this);
        this.handleDeleteDialogToggle = this.handleDeleteDialogToggle.bind(this);
        this.handleValidationPageClick = this.handleValidationPageClick.bind(this);
    }

    async componentDidMount () {
        try {
            const sourceId = this.props.source && this.props.source.id;
            const result = sourceId && this.props.source.validation_enabled && await MonitoringService.getSourceStatus(sourceId);
            const isSourceUp = result && result.status === "up" ? true : false;
            const sourceType = this.props.source.sourceType || "ALEXA SKILL";
            this.setState((prevState) => ({
                ...prevState,
                isSourceUp,
                sourceType,
            }));
        } catch (err) {
            console.log(err);
            this.setState((prevState) => ({
                ...prevState,
                isSourceUp: false,
                sourceType: "ALEXA SKILL",
            }));
        }
    }

    handleItemClick () {
        this.props.onClick();
    }

    handleItemDoubleClick () {
        this.props.onClick();
        this.props.goTo(`/skills/${this.props.source.id}/`);
    }

    async handleDeleteSource (e: any) {
        this.props.handleLoadingChange(true);
        try {
            const source = this.props.source;
            this.handleDeleteDialogToggle(e);
            await this.props.removeSource(source);
        } catch (err) {
            console.log(err);
        } finally {
            this.props.handleLoadingChange(false);
        }
    }

    handleSourceNameChange (value: string) {
        this.setState(prevState => ({
            ...prevState,
            sourceName: value,
        }));
    }

    async updateSourceObject (source: Source) {
        this.setState((prevState) => ({
            ...prevState,
            loading: true,
        }));
        await SourceService.updateSourceObj(source);
        await this.props.getSources();
        this.setState((prevState) => ({
            ...prevState,
            loading: false,
            enableValidation: !prevState.enableValidation,
        }));
    }

    handleDeleteDialogToggle(e: any) {
        e.stopPropagation();
        this.setState((prevState) => ({
            ...prevState,
            deleteDialogActive: !prevState.deleteDialogActive,
        }));
    }

    async handleEnableValidation (e: any) {
        // e.stopPropagation();
        // const validation_enabled = !this.state.enableValidation;
        // const sourceToUpdate = {...this.props.source, validation_enabled};
        // await this.updateSourceObject(sourceToUpdate);
    }

    async handleValidationPageClick () {
        this.props.goTo(`/skills/${this.props.source.id}/`);
    }

    render() {
        const validationEnabledStyle = this.props.source.validation_enabled ? SourceSelectorItemStyle.enabled : "";
        const sourceItemActive = this.props.active ? SourceSelectorItemStyle.active : "";
        const rows = this.props.source && this.props.source.validation_script && this.props.source.validation_script.split(/\r?\n/);
        const showValidationResultRows = this.state.enableValidation && rows && rows.length ? SourceSelectorItemStyle.visible : "";
        const itemHeight = rows && rows.length ? "" : SourceSelectorItemStyle.small_height;
        return this.props.source ? (
                <div className={`${SourceSelectorItemStyle.item} ${SourceSelectorItemStyle.show_skill_container} ${sourceItemActive} ${itemHeight}`} onClick={this.handleItemClick} onDoubleClick={this.handleItemDoubleClick}>
                    <div>
                        <div className={SourceSelectorItemStyle.child_container}>
                            <div className={SourceSelectorItemStyle.source_type_text}>{this.state && this.state.sourceType}</div>
                            {
                                // TODO: Extract this to a component
                                (
                                    this.props.source.sourceType === "hybrid" ?
                                        (
                                            <div className={SourceSelectorItemStyle.hybrid_source}>
                                                <img src={"https://bespoken.io/wp-content/uploads/2018/03/amazon-alexa.png"} alt={"alexa icon"}/>
                                                <img src={"https://bespoken.io/wp-content/uploads/2018/03/google-actions.png"} alt={"google action icon"}/>
                                            </div>
                                        ) :
                                        this.state.sourceType === "google" ?
                                            <img src={"https://bespoken.io/wp-content/uploads/2018/03/google-actions.png"} alt={"google action icon"}/> :
                                            <img src={"https://bespoken.io/wp-content/uploads/2018/03/amazon-alexa.png"} alt={"alexa icon"}/>
                                )
                            }
                            <div className={SourceSelectorItemStyle.source_name}>{this.props.source.name}</div>
                            <div className={`${SourceSelectorItemStyle.enable_monitoring} ${validationEnabledStyle}`}>
                                <div>
                                    <span>MONITORING</span>
                                    <span>{this.props.source.validation_enabled ? "ENABLED" : "DISABLED"}</span>
                                </div>
                                <IconButton disabled={true} icon={"power_settings_new"} onClick={this.handleEnableValidation}/>
                            </div>
                        </div>
                        <div className={`${SourceSelectorItemStyle.validation_items_container} ${showValidationResultRows}`}>
                            {
                                this.state && this.state.isSourceUp ?
                                    (
                                        <div className={SourceSelectorItemStyle.succeeded}>
                                            <div>ALL YOUR TESTS SUCCEEDED</div>
                                        </div>
                                    ) :
                                    (
                                        <div className={SourceSelectorItemStyle.failed}>
                                            <div>AT LEAST 1 OF YOUR TESTS FAILED</div>
                                        </div>
                                    )
                            }
                        </div>
                        {
                            this.state.enableValidation && rows && rows.length &&
                            (
                                <div className={SourceSelectorItemStyle.items_processed_Text}>
                                    {rows && rows.length || "0"} TOTAL TESTS
                                </div>
                            )
                        }
                        <div className={SourceSelectorItemStyle.delete_button_container}>
                            <IconButton className={SourceSelectorItemStyle.delete_button} icon={"delete"}
                                        onClick={this.handleDeleteDialogToggle}/>
                        </div>
                        {
                            !this.state.enableValidation || !(rows && rows.length) ?
                                (
                                    <div onClick={this.handleValidationPageClick}
                                         className={SourceSelectorItemStyle.validate_button}>{"Validate your skill >>"}</div>
                                ) :
                                ""
                        }
                        <Dialog
                            theme={DeleteDialogTheme}
                            actions={this.dialogActions}
                            active={this.state.deleteDialogActive}
                            onEscKeyDown={this.handleDeleteDialogToggle}
                            onOverlayClick={this.handleDeleteDialogToggle}
                            title="Delete Source">
                            <p>Are you sure you want to delete {this.props.source.name}? This cannot be undone.</p>
                        </Dialog>
                    </div>
                </div>
            ) :
            <span />;
    }
}
