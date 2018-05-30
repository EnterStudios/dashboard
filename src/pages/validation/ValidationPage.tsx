import * as moment from "moment";
import * as pusher from "pusher-js";
import * as React from "react";
import { connect } from "react-redux";
import {replace} from "react-router-redux";
import {Card, CardText, CardTitle} from "react-toolbox/lib/card";
import {setLoading} from "../../actions/loading";
import {getSources, setCurrentSource} from "../../actions/source";
import {CodeSheet} from "../../components/CodeSheet";
import { Dimensions } from "../../components/Measure";
import RightPanel from "../../components/RightPanel";
import SourcePageTwoPane from "../../components/SourcePageTwoPane";
import ValidationPageGlobalStats from "../../components/Validation/ValidationComponentGlobalStats";
import ValidationParentComponent from "../../components/Validation/ValidationParentComponent";
import {ValidationResultYamlComponent} from "../../components/Validation/ValidationResultYamlComponent";
import Source from "../../models/source";
import {User, UserDetails} from "../../models/user";
import { State } from "../../reducers";
import auth from "../../services/auth";
import {remoteservice} from "../../services/remote-service";
import SourceService from "../../services/source";
import { Location } from "../../utils/Location";

const inputTheme = require("../../themes/input.scss");

interface ValidationPageState {
    dialogActive: boolean;
    loadingValidationResults: boolean;
    monitorEnabled: boolean;
    script: string;
    yamlScript: string;
    visualScript: string;
    validationResults: any;
    token: string;
    tokenChanged: boolean;
    showHelp: boolean;
    showSnackbar: boolean;
    snackbarLabel: any;
    smAPIAccessToken: string;
    channels: any[];
    pusher: pusher.Pusher | undefined;
    vendorID: string;
    vendorIDChanged: boolean;
    myHeight: number;
}

interface ValidationPageProps {
    location?: Location;
    user: User;
    source: Source;
    sources: Source[];
    getSources: () => Promise<Source[]>;
    setSource: (source: Source) => (dispatch: Redux.Dispatch<any>) => void;
    goTo: (path: string) => (dispatch: Redux.Dispatch<any>) => void;
    setLoading: (value: boolean) => (dispatch: Redux.Dispatch<any>) => void;
}

function mapStateToProps(state: State.All) {
    return {
        source: state.source.currentSource,
        user: state.session.user,
        sources: state.source.sources,
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        getSources: function (): Promise<Source[]> {
            return dispatch(getSources());
        },
        setSource: function (source: Source) {
            return dispatch(setCurrentSource(source));
        },
        goTo: function (path: string) {
            return dispatch(replace(path));
        },
        setLoading: function (value: boolean) {
            return dispatch(setLoading(value));
        },
    };
}

export class ValidationPage extends React.Component<ValidationPageProps, ValidationPageState> {
    static readonly lastScriptKeyPrefix = "lastValidationScript";
    static readonly scriptHint = (
        <div className="hint">
            <p>"open guess the price": "how many persons are playing today"</p>
            <p>"two": "tell us what is your name"</p>
            <p>"john": "tell us what is your name"</p>
            <p>"pier": "guess the price"</p>
            <p>"100 dollars": "*"</p>
        </div>);
    static readonly snackbarLabel = (
        <div>
            You must first enter your vendor ID - <a href="https://developer.amazon.com/mycid.html" target="_blank">click here</a> to get it
        </div>);
    constructor(props: any) {
        super(props);
        this.state = {
            dialogActive: false,
            monitorEnabled: false,
            script: "",
            validationResults: undefined,
            loadingValidationResults: false,
            token: "",
            tokenChanged: false,
            showHelp: false,
            snackbarLabel: undefined,
            showSnackbar: false,
            smAPIAccessToken: "",
            channels: [],
            pusher: (process.env.PUSHER_APP_KEY ? new pusher(
                process.env.PUSHER_APP_KEY, {cluster: "us2", encrypted: true})
                : undefined),
            vendorID: "",
            vendorIDChanged: false,
            myHeight: 0,
            yamlScript: "",
            visualScript: "",
        };
        this.onMeasure = this.onMeasure.bind(this);
        this.handleRun = this.handleRun.bind(this);
        this.setupChannel = this.setupChannel.bind(this);
        this.lastScriptKey = this.lastScriptKey.bind(this);
        this.handleGetStarted = this.handleGetStarted.bind(this);
        this.handleHelpChange = this.handleHelpChange.bind(this);
        this.handleTokenChange = this.handleTokenChange.bind(this);
        this.handleDialogToggle = this.handleDialogToggle.bind(this);
        this.updateSourceObject = this.updateSourceObject.bind(this);
        this.handleScriptChange = this.handleScriptChange.bind(this);
        this.handleGetTokenClick = this.handleGetTokenClick.bind(this);
        this.handleSnackbarClick = this.handleSnackbarClick.bind(this);
        this.handleSelectedSource = this.handleSelectedSource.bind(this);
        this.handleVendorIDChange = this.handleVendorIDChange.bind(this);
        this.handleVerifyEmailClick = this.handleVerifyEmailClick.bind(this);
        this.handleShowSnackbarVerifyEmail = this.handleShowSnackbarVerifyEmail.bind(this);
        this.handleMonitorEnabledCheckChange = this.handleMonitorEnabledCheckChange.bind(this);
        this.handleShowSnackbarEnableMonitoring = this.handleShowSnackbarEnableMonitoring.bind(this);
    }

    onMeasure(dimensions: Dimensions) {
        this.state.myHeight = dimensions.height;
        this.setState(this.state);
    }

    lastScriptKey(source: Source) {
        if (source && source.id) {
            return `${ValidationPage.lastScriptKeyPrefix}-${source.id}`;
        }
    }

    async checkLastScript(source: Source) {
        if (source) {
            const fbSource = await SourceService.getSourceObj(source.id);
            const script = fbSource && fbSource.validation_script;
            const visualScript = source.isYamlEditor === undefined ? fbSource && fbSource.validation_script : fbSource && fbSource.visualScript;
            const yamlScript = fbSource && fbSource.yamlScript;
            this.setState(() => ({
                ...this.state,
                validationResults: undefined,
                script,
                visualScript,
                yamlScript,
            }));
        }
    }

    componentDidMount() {
        const self = this;
        const fbSource = this.props.source;
        const script = fbSource && fbSource.validation_script;
        const visualScript = fbSource && fbSource.isYamlEditor === undefined ? fbSource && fbSource.validation_script : fbSource && fbSource.visualScript;
        const yamlScript = fbSource && fbSource.yamlScript;
        auth.currentUserDetails().then((userDetails: UserDetails) => {
            self.setState({
                ...this.state,
                token: userDetails.silentEchoToken,
                vendorID: userDetails.vendorID,
                smAPIAccessToken: userDetails.smAPIAccessToken,
                script,
                visualScript,
                yamlScript,
            });
        });
    }

    setupChannel(token: string, timestamp: number) {
        if (!process.env.PUSHER_APP_KEY) return;
        const self = this;
        const channel = token + timestamp;
        self.setState({...self.state,
            channels: [...self.state.channels, channel]});
        self.state.pusher.subscribe(channel).bind("results", function(data: any) {
            const validationResults = (data && data.message &&
                data.message.validationResults);
            if (!validationResults) return;
            self.setState({
                ...self.state,
                dialogActive: true,
                loadingValidationResults: false,
                validationResults,
            });
        });
    }

    handleVendorIDChange(value: string) {
        this.setState({...this.state, vendorID: value, vendorIDChanged: true});
    }

    componentWillReceiveProps(nextProps: ValidationPageProps, context: any) {
        this.checkLastScript(nextProps.source);
    }

    handleScriptChange(value: string) {
        this.setState((prevState: ValidationPageState) => {
            return {...this.state, script: value};
        });
    }

    handleYamlScriptChange = (value: string) => {
        this.setState((prevState: ValidationPageState) => {
            return {...this.state, yamlScript: value};
        });
    }

    handleVisualScriptChange = (value: string) => {
        this.setState((prevState: ValidationPageState) => {
            return {...this.state, visualScript: value};
        });
    }

    handleHelpChange(e: any) {
        e.preventDefault();
        this.setState({...this.state, showHelp: !this.state.showHelp});
    }

    handleTokenChange(value: string) {
        this.setState({...this.state, token: value, tokenChanged: true});
    }

    handleMonitorEnabledCheckChange(value: boolean) {
        this.setState({...this.state, monitorEnabled: value});
    }

    async updateSourceObject (source: Source) {
        this.props.setLoading(true);
        const sourceToSend = {
            ...source,
            validation_script: source.isYamlEditor ? this.state.yamlScript : this.state.visualScript,
        };
        if (source.isYamlEditor) {
            sourceToSend.yamlScript = this.state.yamlScript
        } else {
            sourceToSend.visualScript = this.state.visualScript;;
        }
        await SourceService.updateSourceObj(sourceToSend);
        const updatedSource = await SourceService.getSourceObj(this.props.source.id);
        await this.props.getSources();
        await this.props.setSource(updatedSource);
        this.props.setLoading(false);
    }

    async handleRun(e: any) {
        const scriptToRun = this.props.source.isYamlEditor ? this.state.yamlScript : this.state.visualScript;
        let {locale} = this.props.source;
        // If user has not selected locale then we default to en-US
        if (!locale) locale = "en-US";
        e.preventDefault();
        const self = this;
        this.setState((prevState: any) => {
            return {...self.state, loadingValidationResults: true};
        }, async () => {
            const validateSource = () => {
                const timestamp = Date.now();
                self.setupChannel(this.state.token, timestamp);
                SourceService.validateSource(this.props.user.userId, scriptToRun,
                    this.state.token, timestamp, this.state.vendorID,
                    this.state.smAPIAccessToken, this.url(), locale)
                    .then((validationResults: any) => {
                        if (validationResults.indexOf("Security token lacks sufficient information") >= 0 ||
                            validationResults.indexOf("Please provide a valid validation token.") >= 0) {
                            self.setState({
                                ...self.state,
                                dialogActive: true,
                                loadingValidationResults: false,
                                showSnackbar: true,
                                snackbarLabel: (
                                    <div dangerouslySetInnerHTML={{__html: validationResults}} />
                                ),
                            });
                        } else if (validationResults.status && validationResults.status === 401) {
                            self.setState({
                                ...self.state,
                                dialogActive: true,
                                loadingValidationResults: false,
                                showSnackbar: true,
                                snackbarLabel: (
                                    <div>
                                        It appears that you are not calling a source you own, please remember to start your script with "open &lt;source invocation name&gt;"
                                    </div>
                                ),
                            });
                        } else {
                            self.setState({
                                ...self.state,
                                dialogActive: true,
                                loadingValidationResults: false,
                                validationResults,
                            });
                        }
                    })
                    .catch(() => {
                        self.setState({
                            ...self.state,
                            loadingValidationResults: false,
                        });
                    });
            };
            await this.updateSourceObject(this.props.source);
            if (this.state.tokenChanged || this.state.vendorIDChanged) {
                const props: any = {};
                if (this.state.tokenChanged) {
                    props.silentEchoToken = this.state.token;
                }
                if (this.state.vendorIDChanged) {
                    props.vendorID = this.state.vendorID;
                }
                auth.updateCurrentUser(props)
                    .then(() => {
                        self.setState({
                            ...self.state,
                            tokenChanged: false,
                        });
                        validateSource();
                    });
            } else {
                validateSource();
            }
        });
    }

    handleDialogToggle = () => {
        if (process.env.PUSHER_APP_KEY && this.state.dialogActive) {
            this.state.channels.forEach(channel => {
                this.state.pusher.unsubscribe(channel);
            });
        }
        this.setState({...this.state, dialogActive: !this.state.dialogActive});
    }

    url(): string  {
        const baseURL = window.location.protocol + "//" +
            window.location.hostname +
            (window.location.port ? ":" + window.location.port : "");
        return `${baseURL}${this.props.location.basename}${this.props.location.pathname}`;
    }

    virtualDeviceLinkAccountURL(): string {
        const virtualDeviceURL = process.env.NODE_ENV === "production"
            ? process.env.VIRTUAL_DEVICE_URL
            : "https://virtual-device-dev.bespoken.io/";
        return this.props.user
            ? `${virtualDeviceURL}` +
            `link_account?dashboard_user_id=${this.props.user.userId}` +
            `&force_new_device=true` +
            `&callback_url=${encodeURIComponent(SourceService.LINK_AVS_URL)}` +
            (this.state.token ? `&user_id=${this.state.token}` : "")
            : "";
    }

    handleGetTokenClick(e: any) {
        e.preventDefault();
        const redirect = () => {
            window.location.href = this.virtualDeviceLinkAccountURL();
        };
        redirect();
    }

    handleShowSnackbarEnableMonitoring() {
        this.setState(prevState => ({
            ...prevState,
            snackbarLabel: (
                <div>
                    You must first enter your validation token <a href={"#"} onClick={this.handleGetTokenClick}>click here</a> to get it
                </div>
            ),
            showSnackbar: true
        }));
    }

    handleShowSnackbarVerifyEmail() {
        this.setState(prevState => ({
            ...prevState,
            snackbarLabel: (
                <div>
                    To enable monitoring, you must have a verified email address.<a
                    onClick={this.handleVerifyEmailClick} className="cursor-pointer"> Click here </a>to receive a verification
                    email.
                </div>
            ),
            showSnackbar: true
        }));
    }

    handleShowSnackbarScriptEmpty = () => {
        this.setState(prevState => ({
            ...prevState,
            snackbarLabel: (
                <div>
                    You need to have a script to enable monitoring
                </div>
            ),
            showSnackbar: true
        }));
    }

    async handleVerifyEmailClick() {
        await remoteservice.defaultService().auth().currentUser.sendEmailVerification();
        this.setState(prevState => ({
            ...prevState,
            snackbarLabel: (
                <div>
                    Verification email sent!
                </div>
            ),
            showSnackbar: true
        }));
    }

    handleSnackbarClick() {
        this.setState({...this.state, showSnackbar: false});
    }

    handleSelectedSource(value: any) {
        for (const item of this.props.sources) {
            if (item.id === value) {
                this.props.setSource(item);

                const currentPath = this.props.location.pathname;
                const newPath = currentPath.replace(this.props.source.id, item.id);

                this.props.goTo(newPath);
            }
        }
    }

    handleGetStarted () {
        this.props.goTo("/skills/" + this.props.source.id + "/integration");
    }

    render() {
        const dropdownableSources = this.props.sources && this.props.sources.length && this.props.sources.map(source => ({source, label: source.name, value: source.id}));
        const isYamlEditor = this.props.source && this.props.source.isYamlEditor;
        return (
            <SourcePageTwoPane isYamlEditor={isYamlEditor}>
                {(
                    <ValidationParentComponent
                        source={this.props.source}
                        sources={dropdownableSources}
                        getSources={this.props.getSources}
                        setSource={this.props.setSource}
                        token={this.state.token}
                        vendorID={this.state.vendorID}
                        script={this.state.script}
                        yamlScript={this.state.yamlScript}
                        visualScript={this.state.visualScript}
                        scriptHint={ValidationPage.scriptHint}
                        showSnackbar={this.state.showSnackbar}
                        snackbarLabel={this.state.snackbarLabel}
                        setLoading={this.props.setLoading}
                        showHelp={this.state.showHelp}
                        validationHelp={<ValidationHelp/>}
                        validationResults={this.state.validationResults}
                        loadingValidationResults={this.state.loadingValidationResults}
                        dialogActive={this.state.dialogActive}
                        monitorEnabled={this.state.monitorEnabled}
                        handleRun={this.handleRun}
                        handleSelectedSource={this.handleSelectedSource}
                        handleTokenChange={this.handleTokenChange}
                        handleGetTokenClick={this.handleGetTokenClick}
                        handleSnackbarClick={this.handleSnackbarClick}
                        handleVendorIDChange={this.handleVendorIDChange}
                        handleScriptChange={this.handleScriptChange}
                        handleYamlScriptChange={this.handleYamlScriptChange}
                        handleVisualScriptChange={this.handleVisualScriptChange}
                        handleHelpChange={this.handleHelpChange}
                        handleDialogToggle={this.handleDialogToggle}
                        handleMonitorEnabledCheckChange={this.handleMonitorEnabledCheckChange}
                        handleShowSnackbarEnableMonitoring={this.handleShowSnackbarEnableMonitoring}
                        handleShowSnackbarVerifyEmail={this.handleShowSnackbarVerifyEmail}
                        handleShowSnackbarScriptEmpty={this.handleShowSnackbarScriptEmpty}
                        isYamlEditor={isYamlEditor}
                    />
                )}
                {
                    process.env.NODE_ENV !== "production" ?
                        (
                            this.props.source && this.props.source.isYamlEditor ?
                                (
                                    this.state && <ValidationResultYamlComponent unparsedHtml={this.state.validationResults} />
                                ) :
                                !(this.props.source && this.props.source.hasIntegrated) ?
                                    (
                                        <RightPanel handleGetStarted={this.handleGetStarted}/>
                                    ) :
                                    (
                                        <ValidationPageGlobalStats source={this.props.source}
                                                                   startDate={moment().subtract(7, "days")}
                                                                   endDate={moment()} setLoading={this.props.setLoading}
                                                                   goTo={this.props.goTo}/>
                                    )
                        ) :
                        (
                            !(this.props.source && this.props.source.hasIntegrated) ?
                                    (
                                        <RightPanel handleGetStarted={this.handleGetStarted}/>
                                    ) :
                                    ""
                        )
                }
            </SourcePageTwoPane>
        );
    }
}

export default connect(
  mapStateToProps,
    mapDispatchToProps
)(ValidationPage);

class ValidationHelp extends React.Component<any, any> {
    static highlight: React.CSSProperties = {
        fontWeight: "bold"
    };
    render() {
        return (
            <Card className={`${inputTheme.card}`}>
                <CardTitle><h6 className={`${inputTheme.title}`}>Validation Help</h6></CardTitle>
                <CardText>
                    <p>The Validation Script has the following structure:</p>
                    <CodeSheet>{
                        `"Input": "Expected Output"`
                    }</CodeSheet>
                    <p><span style={ValidationHelp.highlight}>Input</span>: What the user is meant to say to Alexa</p>
                    <p><span style={ValidationHelp.highlight}>Expected Output</span>: The expected response from Alexa</p>
                    <p>For the expected output:</p>
                    <ul>
                        <li>If the result is audio, the expected output is compared to the transcript of the audio.</li>
                        <li>If the result is a stream URL, the expected output is compared to the URL.</li>
                    </ul>
                    <p>In either case, the comparison works as a "contains" - if the value of the expected output appears anywhere in the result, it is accepted.</p>
                    <p>For example, in the case of a test like this:</p>
                    <CodeSheet>{`"hello": "hi"`}</CodeSheet>
                    <p>This test will succeed if the result is "hi", "hi there", or "oh hi"</p>
                    <p>Tests are run in a series, and can build off of each other. So a sequence may be:</p>
                    <CodeSheet>{
                        `"open my skill": "welcome"\n` +
                        `"about": "I am a skill"\n` +
                        `"more": "I can do things"`
                    }</CodeSheet>
                    <p>These commands will be run one after another, as if a user was interacting with Alexa through a series of prompts.</p>
                </CardText>
            </Card>
        );
    }
}
