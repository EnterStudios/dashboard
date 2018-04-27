import * as React from "react";
import Source from "../models/source";
import LocaleDropdown from "./LocaleDropdown/LocaleDropdown";
import SourceDropdown from "./SourceDropdown/SourceDropdown";

const InlineEditInput = require("riek").RIEInput;

const theme = require("../themes/autosuggest.scss");
const inputTheme = require("../themes/input.scss");

interface TitleProps {
    source: Source;
    handleUpdateSource?: (source: Source) => void;
}

export class Title extends React.Component<TitleProps, any> {

    static defaultProps: TitleProps = {
        source: undefined,
    };

    constructor(props: TitleProps) {
        super(props);

        this.state = {
            sourceName: "",
        };
    }

    componentDidMount () {
        this.setState(() => ({
            sourceName: this.props.source && this.props.source.name || "",
        }));
    }

    updateSourceWithProps = (props: any) => {
        if (this.props.source) {
            this.props.handleUpdateSource && this.props.handleUpdateSource({...this.props.source, ...props, name: this.state.sourceName});
        }
    }

    handleTypeChange = (sourceType: string) => {
        this.updateSourceWithProps({sourceType});
    }

    handleLocaleChange = (locale: string) => {
        this.updateSourceWithProps({locale});
    }

    handleSourceNameChange = async (value: any) => {
        const {sourceName} = value;
        this.updateSourceWithProps({name: sourceName});
        this.setState(() => ({
            sourceName,
        }));
    }

    render() {
        const selectedSource = this.props.source;
        const selectedSourceType = selectedSource && selectedSource.sourceType &&
            ["alexa", "google", "hybrid"].indexOf(selectedSource.sourceType) >= 0 ? selectedSource.sourceType : "alexa";
        const selectedSourceLocale = selectedSource && selectedSource.locale ? selectedSource.locale : "en-US";
        let title: JSX.Element = (<div/>);
        if (this.props.source) {
            title = (
                <div className={theme.title_container}>
                    {
                        (
                            selectedSourceType === "hybrid" ?
                                (
                                    <div className={theme.hybrid_source}>
                                        <img src={"https://bespoken.io/wp-content/uploads/2018/03/amazon-alexa.png"} alt={"alexa icon"}/>
                                        <img src={"https://bespoken.io/wp-content/uploads/2018/03/google-actions.png"} alt={"google action icon"}/>
                                    </div>
                                ) :
                                selectedSourceType === "google" ?
                                    <img src={"https://bespoken.io/wp-content/uploads/2018/03/google-actions.png"} alt={"google action icon"}/> :
                                    <img src={"https://bespoken.io/wp-content/uploads/2018/03/amazon-alexa.png"} alt={"alexa icon"}/>
                        )
                    }
                    <InlineEditInput className={inputTheme.validation_page} classEditing={inputTheme.validation_page_edit} propName={"sourceName"} value={this.state.sourceName} change={this.handleSourceNameChange} />
                    <SourceDropdown sourceType={selectedSourceType} handleTypeChange={this.handleTypeChange} />
                    <LocaleDropdown locale={selectedSourceLocale} handleLocaleChange={this.handleLocaleChange} />
                </div>
            );
        }

        return title;
    }
}
