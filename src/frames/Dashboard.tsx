import * as classNames from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { push, replace } from "react-router-redux";
import Snackbar from "react-toolbox/lib/snackbar";
import { setLoading } from "../actions/loading";
import { logout, setUser } from "../actions/session";
import { getSources, setCurrentSource } from "../actions/source";
import Content from "../components/Content";
import { Dropdownable, Header, PageButton } from "../components/Header";
import Layout from "../components/Layout";
import { Loader } from "../components/Loader/Loader";
import Popup from "../components/Popup";
import UserControl from "../components/UserControl";
import { CLASSES } from "../constants";
import Source from "../models/source";
import User, { UserDetails } from "../models/user";
import { State } from "../reducers";
import auth from "../services/auth";
import { remoteservice } from "../services/remote-service";
import SourceService from "../services/source";
import SpokeService from "../services/spokes";
import ArrayUtils from "../utils/array";
import { Location } from "../utils/Location";
/**
 * Simple Adapter so a Source can conform to Dropdownable
 */
const globalWindow: any = typeof (window) !== "undefined" ? window : {};
class SourceDropdownableAdapter implements Dropdownable {

  constructor(readonly source: Source) {
  }

  get value() {
    return this.source.id;
  }

  get label() {
    return this.source.name;
  }
}

interface DashboardProps {
  user: User;
  currentSource: Source;
  sources: Source[];
  location: Location;
  amazonFlow: boolean;
  login: () => (dispatch: Redux.Dispatch<any>) => void;
  logout: () => (dispatch: Redux.Dispatch<any>) => void;
  getSources: () => Promise<Source[]>;
  setSource: (source: Source) => (dispatch: Redux.Dispatch<any>) => void;
  goTo: (path: string) => (dispatch: Redux.Dispatch<any>) => void;
  setUser: (user: User) => (dispatch: Redux.Dispatch<any>) => void;
  loading: boolean;
  setLoading: (value: boolean) => (dispatch: Redux.Dispatch<any>) => void;
}

interface DashboardState {
  showModal: boolean;
  emailVerificationStatus: "loading" | "asking" | "sent" | "done";
  isValidationPage?: boolean; // temporal boolean to remove source title on validationPage
}

function mapStateToProps(state: State.All) {
  return {
    user: state.session.user,
    currentSource: state.source.currentSource,
    sources: state.source.sources,
    amazonFlow: state.session.amazonFlow,
    loading: state.loading.loading,
  };
}

function mapDispatchToProps(dispatch: any) {
  return {
    login: function () {
      return dispatch(push("/login"));
    },
    logout: function () {
      return dispatch(logout());
    },
    getSources: function (): Promise<Source[]> {
      return dispatch(getSources());
    },
    setSource: function (source: Source) {
      return dispatch(setCurrentSource(source));
    },
    goTo: function (path: string) {
      return dispatch(replace(path));
    },
    setUser: function (user: User) {
      return dispatch(setUser(user));
    },
    setLoading: function (value: boolean) {
        return dispatch(setLoading(value));
    },
  };
}

let showAskingSnackbar: boolean = false;

class Dashboard extends React.Component<DashboardProps, DashboardState> {

  constructor(props: DashboardProps) {
    super(props);

    this.handleSelectedSource = this.handleSelectedSource.bind(this);
    this.handlePageSwap = this.handlePageSwap.bind(this);
    this.handleHomeClick = this.handleHomeClick.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleEnterContest = this.handleEnterContest.bind(this);
    this.handleVerifyEmailClick = this.handleVerifyEmailClick.bind(this);
    this.handleSnackbarHiding = this.handleSnackbarHiding.bind(this);
    this.emailVerificationSnackbarLabel = this.emailVerificationSnackbarLabel.bind(this);

    this.state = {
      showModal: false,
      emailVerificationStatus: "loading",
      isValidationPage: false,
    };

    showAskingSnackbar = !this.props.user.emailVerified;
  }

  drawerClasses() {
    return classNames(CLASSES.TEXT.BLUE_GREY_50, CLASSES.COLOR.BLUE_GREY_900);
  }

  headerClasses() {
    return classNames(CLASSES.COLOR.CYAN_BESPOKEN, CLASSES.TEXT.GREY_600);
  }

    async componentDidMount() {
        this.props.setLoading(true);
        document.title = "Bespoken Dashboard"; // additional set title here because for some reason production is not getting the title correctly
        const {id, key} = this.props.location.query;
        const goToCurrentSkill = () => this.props.goTo(`/skills/${id}/logs`);
        const goToSkills = () => this.props.goTo("/skills/");
        let redirectTo: () => void = goToSkills;
        if (id && key) {
            const self = this;
            redirectTo = goToCurrentSkill;
            try {
                await SourceService.linkSource({id: id, secretKey: key}, this.props.user);
                const source: Source = await SourceService.getSourceObj(id);
                const pipe: any = await SpokeService.fetchPipe(self.props.user, source);
                if (!pipe.diagnosticsKey) {
                    await SpokeService.savePipe(self.props.user, source, pipe.http, true);
                }
                redirectTo();
            } catch (err) {
                redirectTo();
            }
        }
        await this.props.getSources();
        const userValidationInfo: UserDetails = await auth.currentUserDetails();
        userValidationInfo && globalWindow && globalWindow.Intercom("boot", {
            app_id: process.env.NODE_ENV === "production" ? process.env.INTERCOM_APP_ID_PROD : process.env.INTERCOM_APP_ID_DEV,
            name: this.props.user.displayName,
            email: this.props.user.email,
            skillsAmmount: this.props.sources.length,
            usingMonitoring: this.props.sources.some(source => source.monitoring_enabled),
            usingValidation: !!userValidationInfo.smAPIAccessToken,
            hide_default_launcher: false,
        });
        this.props.setLoading(false);
    }

  componentDidUpdate(previousProps: DashboardProps, previousState: DashboardState) {
    const pathsArray = ["stats", "logs", "integration", "audio", "settings"];
    const isValidationPage = pathsArray.some(path => {
        return location.pathname.indexOf(path) < 0;
    });
    if (showAskingSnackbar && this.state.emailVerificationStatus === "loading" && previousState.emailVerificationStatus === "loading") {
      showAskingSnackbar = false;
      this.setState((prevState, prevProps) => ({
        ...this.state, isValidationPage, emailVerificationStatus: "asking",
      }));
    } else if (previousState.isValidationPage !== isValidationPage) {
        this.setState((prevState, prevProps) => ({
            ...this.state, isValidationPage,
        }));
    }
  }

  componentWillUnmount() {
    globalWindow && globalWindow.Intercom("boot", {
      app_id: process.env.NODE_ENV === "production" ? process.env.INTERCOM_APP_ID_PROD : process.env.INTERCOM_APP_ID_DEV,
      hide_default_launcher: true,
    });
  }

  handleSelectedSource(sourceDropdownableAdapter: SourceDropdownableAdapter) {
    this.props.setSource(sourceDropdownableAdapter.source);

    let currentPath = this.props.location.pathname;
    let newPath = currentPath.replace(this.props.currentSource.id, sourceDropdownableAdapter.source.id);

    this.props.goTo(newPath);
  }

  dropdownableSources(): SourceDropdownableAdapter[] {
    let dropdownableSources = [];

    for (let source of this.props.sources) {
      dropdownableSources.push(new SourceDropdownableAdapter(source));
    }
    return ArrayUtils.sortArrayByProperty(dropdownableSources, "label");
  }

  indexOf(source: Source): number {
    if (source) {
      let length = this.props.sources.length;
      for (let i = 0; i < length; ++i) {
        if (this.props.sources[i].id === source.id) {
          return i;
        }
      }
    }

    return -1;
  }

  pageButtons(): PageButton[] | undefined {
    if (this.props.currentSource) {
      return [
        {
          icon: "validation",
          name: "Validation",
          tooltip: "validation (beta)"
        },
        {
          icon: "stats",
          name: "Check Stats",
          tooltip: "summary"
        },
        {
          icon: "audioMetrics",
          name: "Audio Metrics",
          tooltip: "audio player session metrics"
        },
        {
          icon: "logs",
          name: "Check Logs",
          tooltip: "logs"
        },
        {
          icon: "integration",
          name: "Integration",
          tooltip: "integration"
        },
        {
          icon: "settings",
          name: "Settings",
          tooltip: "settings"
        },
      ];
    } else {
      return undefined;
    }
  }

  handlePageSwap(button: PageButton) {
    this.setState(prevState => {
      return { ...prevState, isValidationPage: false };
    });
    if (button.name === "Check Stats") {
      this.props.goTo("/skills/" + this.props.currentSource.id + "/stats");
    } else if (button.name === "Check Logs") {
      this.props.goTo("/skills/" + this.props.currentSource.id + "/logs");
    } else if (button.name === "Integration") {
      this.props.goTo("/skills/" + this.props.currentSource.id + "/integration");
    } else if (button.name === "Validation") {
      this.setState(prevState => {
        return { ...prevState, isValidationPage: true };
      });
      this.props.goTo("/skills/" + this.props.currentSource.id);
    } else if (button.name === "Audio Metrics") {
      this.props.goTo("/skills/" + this.props.currentSource.id + "/audio");
    } else if (button.name === "Settings") {
      this.props.goTo("/skills/" + this.props.currentSource.id + "/settings");
    }
  }

  handleHomeClick() {
    this.props.goTo("/skills");
  }

  handleOpenModal() {
    const contest = window.localStorage.getItem("contest") === "false";
    if (!contest) {
      window.localStorage.setItem("contest", "false");
      this.setState({ ...this.state, showModal: true });
    }
  }

  handleCloseModal() {
    window.localStorage.setItem("contest", "true");
    this.setState({ ...this.state, showModal: false });
  }

  handleEnterContest() {
    window.open("https://www.surveymonkey.com/r/X5R3W8G", "_blank");
    window.localStorage.setItem("contest", "true");
    this.setState({ ...this.state, showModal: false });
  }

  emailVerificationSnackbarLabel(): any {
    return (
      <div>
        Your email is not yet verified - please click on the link in the email we sent to you at signup. Or click
      <a onClick={this.handleVerifyEmailClick} className="cursor-pointer"> here </a>
        to receive another verification email
      </div>
    );
  }

  async handleVerifyEmailClick() {
    await remoteservice.defaultService().auth().currentUser.sendEmailVerification();
    this.setState({ ...this.state, emailVerificationStatus: "sent" });
  }

  handleSnackbarHiding() {
    this.setState({ ...this.state, emailVerificationStatus: "done" });
    this.props.setUser({ ...this.props.user, emailVerified: true });
  }

  render() {
    const isSourceListPage = /^\/skills\/?$/.test(this.props.location && this.props.location.pathname);
    return (
      <Layout header={true} style={isSourceListPage ? {overflowY: "hidden"} : {}}>
        <Popup
          header={"Win an Echo Show"}
          content={<span>Thanks for being a Bespoken user.<br />Take this 5-minute survey to enter to win 1 of 2 devices. Enter before Sept 30.</span>}
          imgSrc="https://bespoken.io/wp-content/uploads/2017/08/Background.png"
          showButton={true}
          buttonLabel="Enter"
          showModal={this.state.showModal}
          handleCloseModal={this.handleCloseModal}
          handleEnterContest={this.handleEnterContest}
        />
        <Header
          isValidationPage={this.state.isValidationPage}
          className={this.headerClasses()}
          currentSourceId={this.props.currentSource ? this.props.currentSource.id : undefined}
          sources={this.props.currentSource ? this.dropdownableSources() : undefined}
          pageButtons={this.pageButtons()}
          onPageSelected={this.handlePageSwap}
          onSourceSelected={this.handleSelectedSource}
          onHomeClicked={this.handleHomeClick}
          displayHomeButton={this.props.location.pathname !== "/"}
          amazonFlow={this.props.amazonFlow}
          getSources={this.props.getSources}>
          <UserControl
            login={this.props.login}
            logout={this.props.logout}
            user={this.props.user} />
        </Header>
        <Content>
          {this.props.children}
          <Snackbar className="sm-snackbar" action="Dismiss" type="cancel"
            active={this.state.emailVerificationStatus === "asking"}
            onClick={this.handleSnackbarHiding}
            label={this.emailVerificationSnackbarLabel()}
            timeout={10000}
            onTimeout={this.handleSnackbarHiding}
          />
          <Snackbar className="sm-snackbar" action="Dismiss" type="cancel"
            active={this.state.emailVerificationStatus === "sent"}
            onClick={this.handleSnackbarHiding}
            label="Verification email sent!"
            timeout={10000}
            onTimeout={this.handleSnackbarHiding} />
        </Content>
          {process.env.NODE_ENV === "development" && <a className="git-hash" href={`https://github.com/bespoken/dashboard/commit/${process.env.GIT_HASH}`} target="_blank">{process.env.GIT_HASH.slice(0, 7)}</a>}
          {this.props.loading && <Loader/>}
      </Layout>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
