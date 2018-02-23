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
    sourceType: string;
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
            isSourceUp: undefined,
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
        const sourceId = this.props.source && this.props.source.id;
        const result = sourceId && await MonitoringService.getSourceStatus(sourceId);
        const isSourceUp = result && result.status === "up" ? true : false;
        this.setState((prevState) => ({
            ...prevState,
            isSourceUp,
        }));
    }

    handleItemClick () {
        this.props.onClick();
    }

    handleItemDoubleClick () {
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
        e.stopPropagation();
        const validation_enabled = !this.state.enableValidation;
        const sourceToUpdate = {...this.props.source, validation_enabled};
        await this.updateSourceObject(sourceToUpdate);
    }

    async handleValidationPageClick () {
        this.props.goTo(`/skills/${this.props.source.id}/`);
    }

    render() {
        const validationEnabledStyle = this.state.enableValidation ? SourceSelectorItemStyle.enabled : "";
        const sourceItemActive = this.props.active ? SourceSelectorItemStyle.active : "";
        const rows = this.props.source && this.props.source.validation_script && this.props.source.validation_script.split(/\r?\n/);
        const itemHeight = rows && rows.length ? "" : SourceSelectorItemStyle.small_height;
        return this.props.source ? (
                <div className={`${SourceSelectorItemStyle.item} ${SourceSelectorItemStyle.show_skill_container} ${itemHeight}`}>
                    <div className={`${sourceItemActive}`} onClick={this.handleItemClick} onDoubleClick={this.handleItemDoubleClick}>
                        <div className={SourceSelectorItemStyle.child_container}>
                            <div className={SourceSelectorItemStyle.source_type_text}>{this.props.sourceType}</div>
                            <img
                                src={"https://bespoken.io/wp-content/uploads/2018/01/amazon-alexa-logo-D1BE24A213-seeklogo.com_.png"}
                                alt={"alexa icon"}/>
                            <div className={SourceSelectorItemStyle.source_name}>{this.props.source.name}</div>
                            <div className={`${SourceSelectorItemStyle.enable_monitoring} ${validationEnabledStyle}`}>
                                <div>
                                    <span>ENABLE</span>
                                    <span>MONITORING</span>
                                </div>
                                <IconButton icon={"power_settings_new"} onClick={this.handleEnableValidation}/>
                            </div>
                        </div>
                        {
                            this.state.enableValidation && rows && rows.length ?
                                (
                                    <div className={SourceSelectorItemStyle.validation_items_container}>
                                        {
                                            this.state && this.state.isSourceUp ?
                                                (
                                                    <div className={SourceSelectorItemStyle.succeeded}>
                                                        <div>ALL YOUR ITEMS SUCCEEDED</div>
                                                    </div>
                                                ) :
                                                (
                                                    <div className={SourceSelectorItemStyle.failed}>
                                                        <div>AT LEAST 1 OF YOUR ITEMS FAILED</div>
                                                    </div>
                                                )
                                        }
                                    </div>
                                ) :
                                ""
                        }
                        {
                            this.state.enableValidation && rows && rows.length &&
                            (
                                <div className={SourceSelectorItemStyle.items_processed_Text}>
                                    {rows && rows.length || "0"} TOTAL ITEMS
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
