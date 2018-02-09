import * as React from "react";
import Noop from "../utils/Noop";

const Autosuggest: any = require("react-autosuggest");
const theme = require("../themes/autosuggest.scss");

export interface Dropdownable {
  value: string;
  label: string;
}

interface TitleProps {
  handleItemSelect: (value: string) => void;
  sources: any[];
  selectedSourceId: string;
}

const getSuggestions = (value: string, sources: any[]) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;
  return inputLength === 0 ? sources : sources.filter((source: any) =>
    source.label.toLowerCase().slice(0, inputLength) === inputValue
  );
};

const renderSuggestion = (source: any) => {
  return (
    <div>
      {source.label}
    </div>
  );
};

export class Title extends React.Component<TitleProps, any> {

  static defaultProps: TitleProps = {
    handleItemSelect: Noop,
    sources: [],
    selectedSourceId: ""
  };

  constructor(props: TitleProps) {
    super(props);

    this.state = {
      selectedSourceId: undefined,
      value: "",
      suggestions: [],
    };
  }

  getSuggestionValue = (source: any) => {
    this.props.handleItemSelect(source.value);
    return "";
  }

  onChange = (event: any, { newValue }: any) => {
    this.setState({
      value: newValue
    });
  }

  onSuggestionsFetchRequested = ({ value }: any) => {
    this.setState({
      suggestions: getSuggestions(value, this.props.sources)
    });
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  }

  componentWillReceiveProps(nextProps: any) {
    this.setState({
      suggestions: nextProps.sources,
    });
  }

  render() {
    const { value, suggestions } = this.state;
    const selectedSource = this.props.sources.filter(dropDownableSource => dropDownableSource.source.id === this.props.selectedSourceId);
    const selectedSourceName = selectedSource[0] ? selectedSource[0].label : "";
    const shouldRender = () => true;
    const inputProps = {
      placeholder: selectedSourceName,
      value,
      onChange: this.onChange
    };
    let title: JSX.Element = (<div />);
    if (this.props.sources.length > 0) {
      if (this.props.sources.length === 1) {
        title = (
            <div className={theme.title_container}>
                <img src={"https://bespoken.io/wp-content/uploads/2018/01/amazon-alexa-logo-D1BE24A213-seeklogo.com_.png"} alt={"alexa icon"} />
                <div className={theme.soure_name_placeholder}>{this.props.sources[0].label}</div>
                <span>ALEXA SKILL</span>
                {/*<span>Voice App Name</span>*/}
            </div>
        );
      } else {
        title = (
            <div className={theme.title_container}>
                <img src={"https://bespoken.io/wp-content/uploads/2018/01/amazon-alexa-logo-D1BE24A213-seeklogo.com_.png"} alt={"alexa icon"} />
                <div className={theme.soure_name_placeholder}>{selectedSourceName}</div>
                <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    shouldRenderSuggestions={shouldRender}
                    inputProps={inputProps}
                    theme={theme}/>
                <span>ALEXA SKILL</span>
                {/*<span>Voice App Name</span>*/}
            </div>
        );
      }
    }

    return title;
  }
}
