import * as moment from "moment";
import * as React from "react";
import {IconButton, Input} from "react-toolbox";
import Source from "../../models/source";
import service from "../../services/source";

const SourceSelectorStyle = require("./SourceSelectorCreateStyle.scss");

const ButtonTheme = require("../../themes/button_theme.scss");
const InputTheme = require("../../themes/input.scss");

interface SourceSelectorCreateProps {
    sourceType: string;
    getSources: () => Promise<Source[]>;
    goTo: (path: string) => (dispatch: Redux.Dispatch<any>) => void;
    handleLoadingChange: (value: boolean) => void;
    defaultSourceNumber: string;
}

interface SourceSelectorCreateState {
    showCreateSource: boolean;
    sourceName: string;
    enableValidation: boolean;
}

export default class SourceSelectorCreate extends React.Component<SourceSelectorCreateProps, SourceSelectorCreateState> {
    static defaultProps: SourceSelectorCreateProps = {
        sourceType: "ALEXA SKILL",
        getSources: undefined,
        handleLoadingChange: undefined,
        goTo: undefined,
        defaultSourceNumber: "0",
    };

    constructor(props: SourceSelectorCreateProps) {
        super(props);

        this.state = {
            showCreateSource: false,
            sourceName: "",
            enableValidation: false,
        };

        this.handleCreateClick = this.handleCreateClick.bind(this);
        this.handleSourceNameChange = this.handleSourceNameChange.bind(this);
        this.handleEnableValidation = this.handleEnableValidation.bind(this);
        this.handleSourceNameKeyPress = this.handleSourceNameKeyPress.bind(this);
        this.handleCreateAndValidationPageClick = this.handleCreateAndValidationPageClick.bind(this);
    }

    handleCreateClick () {
        this.setState(prevState => ({
            ...prevState,
            showCreateSource: true,
        }));
    }

    handleSourceNameChange (value: string) {
        this.setState(prevState => ({
            ...prevState,
            sourceName: value,
        }));
    }

    async handleSourceNameKeyPress (event: any) {
        if (event.key === "Enter") {
            this.props.handleLoadingChange(true);
            const source: Source = new Source({name: this.state.sourceName || `default${this.props.defaultSourceNumber}`, validation_enabled: this.state.enableValidation, created: moment().toISOString()});
            await service.createSource(source);
            await this.props.getSources();
            this.setState(prevState => ({
                ...prevState,
                sourceName: "",
                showCreateSource: false,
            }));
            this.props.handleLoadingChange(false);
        }
    }

    async handleCreateAndValidationPageClick () {
        this.props.handleLoadingChange(true);
        const source: Source = new Source({name: this.state.sourceName || `default${this.props.defaultSourceNumber}`, validation_enabled: this.state.enableValidation, created: moment().toISOString()});
        const createdSource = await service.createSource(source);
        await this.props.getSources();
        this.setState(prevState => ({
            ...prevState,
            sourceName: "",
            showCreateSource: false,
        }));
        this.props.handleLoadingChange(false);
        this.props.goTo(`/skills/${createdSource.id}/`);
    }

    handleEnableValidation () {
        this.setState(prevState => ({
            ...prevState,
            enableValidation: !prevState.enableValidation,
        }));
    }

    render() {
        const validationEnabledStyle = this.state.enableValidation ? SourceSelectorStyle.enabled : "";
        return this.state.showCreateSource ?
            (
                <div className={`${SourceSelectorStyle.item} ${SourceSelectorStyle.create_skill_container}`}>
                    <div>
                        <div className={SourceSelectorStyle.source_type_text}>{this.props.sourceType}</div>
                        <img src={"https://bespoken.io/wp-content/uploads/2018/01/amazon-alexa-logo-D1BE24A213-seeklogo.com_.png"} alt={"alexa icon"} />
                        <Input theme={InputTheme} className={InputTheme.source_input} value={this.state.sourceName} onChange={this.handleSourceNameChange} onKeyPress={this.handleSourceNameKeyPress} label={"Skill name here"} />
                        <div className={`${SourceSelectorStyle.enable_monitoring} ${validationEnabledStyle}`} >
                            <div>
                                <span>ENABLE</span>
                                <span>MONITORING</span>
                            </div>
                            <IconButton icon={"power_settings_new"} onClick={this.handleEnableValidation} />
                        </div>
                    </div>
                    <div onClick={this.handleCreateAndValidationPageClick} className={SourceSelectorStyle.validate_button}>{"Validate your new skill >>"}</div>
                </div>
            ) :
            (
                <div className={`${SourceSelectorStyle.item} ${SourceSelectorStyle.create_skill}`}>
                    <IconButton className={ButtonTheme.create_skill} theme={ButtonTheme} primary={true} icon={"add"}
                                onClick={this.handleCreateClick}/>
                    <div className={SourceSelectorStyle.create_skill_text}>Create a new skill</div>
                </div>
            );
    }
}
