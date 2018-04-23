import * as React from "react";
import Source from "../models/source";
import LocaleDropdown from "./LocaleDropdown/LocaleDropdown";
import SourceDropdown from "./SourceDropdown/SourceDropdown";

const theme = require("../themes/autosuggest.scss");

interface TitleProps {
    sources: any[];
    selectedSourceId: string;
    handleUpdateSource?: (source: Source) => void;
}

export class Title extends React.Component<TitleProps, any> {

    static defaultProps: TitleProps = {
        sources: [],
        selectedSourceId: ""
    };

    constructor(props: TitleProps) {
        super(props);

        this.state = {
            selectedSourceId: undefined,
            value: "",
        };
    }

    handleTypeChange = async (sourceType: string) => {
        const selectedDropdownableSource = this.props.sources.filter(dropDownableSource => dropDownableSource.source.id === this.props.selectedSourceId);
        const selectedSource = selectedDropdownableSource[0] && selectedDropdownableSource[0].source;
        if (selectedSource) {
            this.props.handleUpdateSource && await this.props.handleUpdateSource({...selectedSource, sourceType});
        }
    }

    handleLocaleChange = async (locale: string) => {
        const selectedDropdownableSource = this.props.sources.filter(dropDownableSource => dropDownableSource.source.id === this.props.selectedSourceId);
        const selectedSource = selectedDropdownableSource[0] && selectedDropdownableSource[0].source;
        if (selectedSource) {
            this.props.handleUpdateSource && await this.props.handleUpdateSource({...selectedSource, locale});
        }
    }

    render() {
        const selectedSource = this.props.sources.filter(dropDownableSource => dropDownableSource.source.id === this.props.selectedSourceId);
        const selectedSourceName = selectedSource[0] ? selectedSource[0].label : "";
        const selectedSourceType = selectedSource[0] &&
            selectedSource[0].source.sourceType &&
            ["alexa", "google", "hybrid"].indexOf(selectedSource[0].source.sourceType) >= 0 ? selectedSource[0].source.sourceType : "alexa";
        const selectedSourceLocale = selectedSource[0] && selectedSource[0].source.locale ? selectedSource[0].source.locale : "en-US";
        let title: JSX.Element = (<div/>);
        if (this.props.sources.length > 0) {
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
                    <div className={theme.soure_name_placeholder}>{selectedSourceName}</div>
                    <SourceDropdown sourceType={selectedSourceType} handleTypeChange={this.handleTypeChange} />
                    <LocaleDropdown locale={selectedSourceLocale} handleLocaleChange={this.handleLocaleChange} />
                </div>
            );
        }

        return title;
    }
}
