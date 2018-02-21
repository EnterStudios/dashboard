import * as React from "react";
import {IconButton} from "react-toolbox";
import Dialog from "react-toolbox/lib/dialog";
import Source from "../../models/source";
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
        };

        this.handleItemClick = this.handleItemClick.bind(this);
        this.handleDeleteSource = this.handleDeleteSource.bind(this);
        this.updateSourceObject = this.updateSourceObject.bind(this);
        this.handleItemDoubleClick = this.handleItemDoubleClick.bind(this);
        this.handleSourceNameChange = this.handleSourceNameChange.bind(this);
        this.handleEnableValidation = this.handleEnableValidation.bind(this);
        this.handleDeleteDialogToggle = this.handleDeleteDialogToggle.bind(this);
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

    render() {
        const validationEnabledStyle = this.state.enableValidation ? SourceSelectorItemStyle.enabled : "";
        const sourceItemActive = this.props.active ? SourceSelectorItemStyle.active : "";
        const rows = this.props.source && this.props.source.validation_script && this.props.source.validation_script.split(/\r?\n/);
        return this.props.source ? (
                <div onClick={this.handleItemClick} onDoubleClick={this.handleItemDoubleClick} className={`${SourceSelectorItemStyle.item} ${SourceSelectorItemStyle.show_skill_container} ${sourceItemActive}`}>
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
                        rows && rows.length ?
                            (
                                <div className={SourceSelectorItemStyle.validation_items_container}>
                                    <div className={SourceSelectorItemStyle.succeeded}>
                                        <div>{rows && rows.length || "0"}</div>
                                        <div>ITEMS<br/>SUCCEEDED</div>
                                    </div>
                                    <div className={SourceSelectorItemStyle.failed}>
                                        <div>0</div>
                                        <div>ITEMS<br/>FAILED</div>
                                    </div>
                                </div>
                            ) :
                            <div className={SourceSelectorItemStyle.validation_items_container}/>
                    }
                    {
                        rows && rows.length &&
                        (
                            <div className={SourceSelectorItemStyle.items_processed_Text}>
                                {rows && rows.length || "0"} ITEMS PROCESSED
                            </div>
                        )
                    }
                    <IconButton className={SourceSelectorItemStyle.delete_button} icon={"delete"} onClick={this.handleDeleteDialogToggle}/>
                    <Dialog
                        theme={DeleteDialogTheme}
                        actions={this.dialogActions}
                        active={this.state.deleteDialogActive}
                        onEscKeyDown={this.handleDeleteDialogToggle}
                        onOverlayClick={this.handleDeleteDialogToggle}
                        title="Delete Source" >
                        <p>Are you sure you want to delete {this.props.source.name}? This action can not be undone.</p>
                    </Dialog>
                </div>
            ) :
            <span />;
    }
}
