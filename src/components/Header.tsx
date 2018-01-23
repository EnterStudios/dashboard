import * as classNames from "classnames";
import * as moment from "moment";
import * as React from "react";
import { Button, IconButton } from "react-toolbox/lib/button";
import { Tab, Tabs } from "react-toolbox/lib/tabs";
import Tooltip from "react-toolbox/lib/tooltip";
import ButtonMenu from "../components/ButtonMenu";
import { MenuItem } from "../components/Menu";
import Log from "../models/log";
import LogQuery from "../models/log-query";
import Query, { EndTimeParameter, SourceParameter, StartTimeParameter } from "../models/query";
import Source from "../models/source";
import logService from "../services/log";

import Noop from "../utils/Noop";

const Autosuggest: any = require("react-autosuggest");
const IconButtonTheme = require("../themes/icon-button-primary-theme.scss");
const LogoButtonTheme = require("../themes/logo-button-theme.scss");
const MenuButtonTheme = require("../themes/button_menu_theme.scss");
const TabMenuTheme = require("../themes/tab_menu_theme.scss");
const TopBarTheme = require("../themes/topbar_theme.scss");
const theme = require("../themes/autosuggest.scss");

export interface Dropdownable {
  value: string;
  label: string;
}

export interface PageButton {
  name: string;
  tooltip: string;
  icon: string | JSX.Element; // String or <svg/>
}

export interface HeaderProps {
  currentSourceId?: string;
  sources?: any[];
  onHomeClicked?: () => void;
  onSourceSelected?: (source: any) => void;
  pageButtons?: PageButton[];
  onPageSelected?: (button: PageButton) => void;
  displayHomeButton?: boolean;
  className?: string;
  isValidationPage?: boolean;
  amazonFlow?: boolean;
}

export interface HeaderState {
  selectedSourceId?: string;
  amazonFlow?: boolean;
}

/**
 * Header for the Dashboard frame
 *
 * TODO: We may want to consider renaming this since it is not a resuable header
 * component and is instead can only be used by the Dashboard frame.
 */
export class Header extends React.Component<HeaderProps, HeaderState> {

  constructor(props: HeaderProps) {
    super(props);
    this.state = { selectedSourceId: this.props.currentSourceId, amazonFlow: this.props.amazonFlow };
    this.handleSettingsPageClick = this.handleSettingsPageClick.bind(this);
  }

  componentWillReceiveProps(nextProps: HeaderProps, context: any) {
    if (this.props.currentSourceId !== nextProps.currentSourceId) {
      this.setState((prevState, props) => { return { ...this.state, selectedSourceId: nextProps.currentSourceId }; });
    }
    if (this.props.amazonFlow !== nextProps.amazonFlow) {
      this.setState((prevState, props) => { return { ...this.state, amazonFlow: nextProps.amazonFlow }; });
    }
  }

  classes() {
    return classNames("mdl-layout__header", this.props.className);
  }

  handleSettingsPageClick() {
    this.props.onPageSelected({ name: "settings", icon: "settings", tooltip: "settings" });
  }

  handleItemSelect = (value: string) => {
    this.state.selectedSourceId = value;

    // Now find the source and pass it back out
    for (let item of this.props.sources) {
      if (item.value === value && this.props.onSourceSelected) {
        this.props.onSourceSelected(item);
      }
    }
  }

  render() {
    return (
        <header className={this.classes()}>
            <div className={classNames("mdl-layout__header-row", TopBarTheme.gray_top_bar)} />
            <div className={classNames("mdl-layout__header-row", TopBarTheme.container)}>
                <Home
                    handleHomeClick={this.props.onHomeClicked}
                    showHome={this.props.displayHomeButton}/>
                <div className={classNames(TopBarTheme.title)}>
                    <h4>Voice Apps</h4>
                    <span>-> Skills</span>
                    <span>-> Actions</span>
                    <span>-> Hybrids</span>
                </div>
                <ButtonMenu className={MenuButtonTheme.help_menu_button} raised={true} position="topRight"
                            label="Need Help?">
                    <MenuItem
                        key="1"
                        to="https://github.com/bespoken/dashboard/issues/new?labels=bug"
                        icon="bug_report"
                        caption="File Bug"/>
                    <MenuItem
                        key="2"
                        to="https://github.com/bespoken/dashboard/issues/new?labels=feature%20request&body="
                        icon="build"
                        caption="Request Feature"/>
                    <MenuItem
                        key="3"
                        to="https://gitter.im/bespoken/bst?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"
                        icon="question_answer"
                        caption="Talk to Us"/>
                    <MenuItem
                        key="4"
                        to="mailto:contact@bespoken.io"
                        icon="email"
                        caption="Email"/>
                </ButtonMenu>
                {this.props.children}
                {
                    this.props && this.props.pageButtons && this.props.pageButtons.length &&
                    <IconButton className={TabMenuTheme.settings_button} onClick={this.handleSettingsPageClick} icon={"settings"} />
                }
            </div>
            <div className={classNames("mdl-layout__header-row", TopBarTheme.container, TopBarTheme.bg_white)}>
                {
                    this.state && this.state.amazonFlow &&
                    <a onClick={this.props.onHomeClicked} className={classNames(TopBarTheme.back_to_site_link)}>{"<< Back to the site"}</a>
                }
                {
                    this.props.isValidationPage &&
                    (
                        <Title
                            sources={this.props.sources}
                            handleItemSelect={this.handleItemSelect}
                            selectedSourceId={this.state.selectedSourceId}/>
                    )
                }
                <PageSwap
                    source={this.props.currentSourceId}
                    sources={this.props.sources}
                    pageButtons={this.props.pageButtons}
                    onPageSelected={this.props.onPageSelected}/>
                <div className="mdl-layout-spacer"/>
            </div>
        </header>
    );
  }
}

export default Header;

interface HomeProps {
  handleHomeClick: () => void;
  showHome: boolean;
}

export class Home extends React.Component<HomeProps, any> {
  render() {
    let home: JSX.Element = (<div />);
    if (this.props.showHome) {
      home = (
        <Button
          theme={LogoButtonTheme}
          accent
          onClick={this.props.handleHomeClick} />
      );
    }

    return home;
  }
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
        title = (<span className="mdl-layout-title">{this.props.sources[0].label}</span>);
      } else {
        title = (
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={renderSuggestion}
            shouldRenderSuggestions={shouldRender}
            inputProps={inputProps}
            theme={theme}
          />
        );
      }
    }

    return title;
  }
}

interface PageSwapProps {
  source?: string;
  sources?: any[];
  pageButtons?: PageButton[];
  onPageSelected?: (button: PageButton) => void | undefined;
  style?: any;
  getLogs?: (query: LogQuery, location?: Location) => Promise<Log[]>;
}

interface PageSwapState {
  tabs: JSX.Element[];
  index?: any;
}

const TooltipButton = Tooltip(IconButton);

export class PageSwap extends React.Component<PageSwapProps, PageSwapState> {

  static defaultProps: PageSwapProps = {
    pageButtons: [],
    onPageSelected: Noop,
  };

  constructor(props: PageSwapProps) {
    super(props);

    this.state = { tabs: [], index: 0 };

    this.handleSelected = this.handleSelected.bind(this);
  }

  componentWillReceiveProps(props: PageSwapProps, context: any) {
    this.buildButtons(props);
  }

  componentWillMount() {
    this.buildButtons(this.props);
  }

  handleSelected(button: PageButton) {
    this.props.onPageSelected(button);
  }

  async buildButtons(props: PageSwapProps) {
    let i = 0;
    if (props.pageButtons) {
      const tabs = [];
      for (const button of props.pageButtons) {
        if (await allowTab(button.name, props)) { tabs.push(button); }
      }
      this.setState({
        ...this.state, tabs: tabs.map(button => {
          const handleSelectTab = () => {
            this.handleSelected(button);
          };
          return <Tab className={button.icon.toString()} key={++i} label={button.name} onActive={handleSelectTab} />;
        })
      });
    };
  }

  render() {
    const handleTabChange = (index: any) => {
      this.setState({ ...this.state, index });
    };
    return (
      <div className="responsive-page-swap" style={this.props.style}>
        {
          this.state && this.state.tabs.length ?
            (
              <Tabs style={{ overflowX: "scroll" }} theme={TabMenuTheme} index={this.state.index} onChange={handleTabChange}>
                {this.state && this.state.tabs}
              </Tabs>
            ) : undefined
        }
      </div>
    );
  }
}

interface HeaderButtonProps {
  button: PageButton;
  onClick: (button: PageButton) => void;
  style?: any;
  className?: string;
}

export class HeaderButton extends React.Component<HeaderButtonProps, any> {

  constructor(props: HeaderButtonProps) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.onClick(this.props.button);
  }

  render() {
    const { button } = this.props;
    return (
      <TooltipButton
        style={this.props.style}
        className={this.props.className}
        theme={IconButtonTheme}
        accent
        tooltip={button.tooltip}
        icon={button.icon}
        onClick={this.handleClick} />
    );
  }
}

async function allowTab(tab: string, props: any) {
  switch (tab) {
    case "Check Stats":
    case "Check Logs": {
      const currentSource = props.sources.find((source: any) => {
        return source.value === props.source;
      });
      const query: LogQuery = new LogQuery({
        source: (currentSource && currentSource.source) || {} as Source,
        startTime: moment().subtract(7, "days"), // change 7 for the right time span once implemented
        endTime: moment(),
        limit: 50
      });
      let endpoint;
      return !!(await logService.getLogs(query, endpoint)).length;
    }
    case "Audio Metrics": {// should we have this conditional tab as well?
      const query: Query = new Query();
      query.add(new SourceParameter(props.source));
      query.add(new StartTimeParameter(moment().subtract(7, "days"))); // change 7 for the right time span once implemented
      query.add(new EndTimeParameter(moment()));
      try {
        return !!(await logService.getAudioSessions(query)).audioSessions.length;
      } catch (err) {
        return false;
      }
    }
    case "settings": {
      return false;
    }
    default:
      return true;
  }
}
