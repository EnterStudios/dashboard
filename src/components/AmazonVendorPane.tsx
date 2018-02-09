import * as classNames from "classnames";
import * as React from "react";
import { IconButton } from "react-toolbox";
import { Button } from "react-toolbox/lib/button";
import Input from "react-toolbox/lib/input";
import Tooltip from "react-toolbox/lib/tooltip";
import { AmazonFlowFlag } from "../actions/session";
import { SET_AMAZON_FLOW } from "../constants";
import Source from "../models/source";
import { User, UserDetails } from "../models/user";
import auth from "../services/auth";
import SourceService from "../services/source";
import { Loader } from "./Loader/Loader";
import { Dimensions, Measure } from "./Measure";
import LandingAmazonPageTwoPane from "./SourcePageTwoPane";

const ButtonTheme = require("../themes/button_theme.scss");
const InputTheme = require("../themes/input.scss");
const VendorPaneStyle = require("../themes/amazon_pane.scss");
const TooltipTheme = require("../themes/landing-page-tooltips.scss");
const TooltipButton = Tooltip(IconButton);

interface AmazonVendorPaneProps {
    user?: User;
    spacing: boolean;
    setAmazonFlow: (amazonFlow: boolean) => AmazonFlowFlag;
    amazonFlow: boolean;
    goTo?: (path: string) => void;
    sources?: Source[];
    isParentLoading?: boolean;
}

interface AmazonVendorPaneState {
    myHeight: number;
    vendorID: string;
    token: string;
    loading: boolean;
}

export default class AmazonVendorPane extends React.Component<AmazonVendorPaneProps, AmazonVendorPaneState> {
    static defaultProps: {
        user: undefined,
        spacing: false,
        amazonFlow: true,
        setAmazonFlow: () => {type: SET_AMAZON_FLOW, amazonFlow: true},
        finishLoading: false,
    };
    constructor(props: AmazonVendorPaneProps) {
        super(props);
        this.state = {
            myHeight: 0,
            vendorID: "",
            token: "",
            loading: false,
        };
        this.onMeasure = this.onMeasure.bind(this);
        this.handleVendorIDChange = this.handleVendorIDChange.bind(this);
        this.handleGetStarted = this.handleGetStarted.bind(this);
    }

    componentDidMount() {
        const self = this;
        auth.currentUserDetails()
            .then((userDetails: UserDetails) => {
                self.setState({
                    ...this.state,
                    token: userDetails.silentEchoToken,
                    vendorID: userDetails.vendorID,
                });
            });
    }

    async componentDidUpdate (prevProps: AmazonVendorPaneProps, prevState: AmazonVendorPaneState) {
        if (prevProps.sources !== this.props.sources && this.props.sources.length) {
            const userDetails = await auth.currentUserDetails();
            const stepCompleted = userDetails.silentEchoToken && userDetails.vendorID;
            if (stepCompleted) {
                await this.props.setAmazonFlow(false);
                this.props.goTo(`/skills/${this.props.sources[0].id}/`);
            }
        }
    }

    onMeasure(dimensions: Dimensions) {
        this.setState({ ...this.state, myHeight: dimensions.height });
    }

    handleVendorIDChange(value: string) {
        this.setState({ ...this.state, vendorID: value });
    }

    async handleGetStarted() {
        this.setState((prevState) => {
            return {...prevState, loading: true};
        });
        await auth.updateCurrentUser({ vendorID: this.state.vendorID });
        const userDetails = await auth.currentUserDetails();
        if (userDetails && userDetails.smAPIAccessToken) {
            try {
                const skillsList = await SourceService.createSkillsFromAmazon(this.props.user.userId, this.state.vendorID, userDetails.smAPIAccessToken);
                if (skillsList && skillsList.length) {
                    const lastSourceId = skillsList[skillsList.length - 1];
                    await this.props.setAmazonFlow(false);
                    this.setState((prevState) => {
                        return {...prevState, loading: false};
                    });
                    this.props.goTo(`/skills/${lastSourceId}/`);
                }
            } catch (err) {
                this.setState((prevState) => {
                    return {...prevState, loading: false};
                });
                this.props.setAmazonFlow(false);
            }
        } else {
            this.setState((prevState) => {
                return {...prevState, loading: false};
            });
            this.props.setAmazonFlow(false);
        }
    }

    virtualDeviceLinkAccountURL(): string {
        const virtualDeviceURL = process.env.VIRTUAL_DEVICE_URL
            ? process.env.VIRTUAL_DEVICE_URL
            : "https://virtual-device-dev.bespoken.io/";
        return this.props.user
            ? `${virtualDeviceURL}` +
            `link_account?dashboard_user_id=${this.props.user.userId}` +
            `&callback_url=${encodeURIComponent(SourceService.LINK_AVS_URL)}` +
            (this.state.token ? `&user_id=${this.state.token}` : "")
            : "";
    }

    render() {
        const spacing = this.props.spacing !== undefined && this.props.spacing;
        return (
            <Measure
                onMeasure={this.onMeasure}>
                <LandingAmazonPageTwoPane spacing={spacing}>
                    {(
                        <div className={VendorPaneStyle.main_content}>
                            <h5>We only need two more pieces of
                                information before we can get you started</h5>
                            <h4>
                                Validation Token
                                <TooltipButton className={VendorPaneStyle.info_button} icon={"info"} tooltip={"In order to get the most out of our validation features, you will be redirected to the amazon developer page and asked to give us access to your skills information."} theme={TooltipTheme}/>
                            </h4>
                            <span>
                                <Input
                                    className={classNames(InputTheme.validation_token_input)}
                                    style={{ color: "#000" }}
                                    theme={InputTheme}
                                    label="Validation token"
                                    value={this.state.token}
                                    required={true}
                                    disabled={true} />
                            </span>
                            <small>To get a validation token, <a href={this.virtualDeviceLinkAccountURL()}
                            >click here</a>
                            </small>
                            <h4>
                                Vendor ID
                                <TooltipButton className={VendorPaneStyle.info_button} icon={"info"} tooltip={"To retrieve your vendor ID go to https://developer.amazon.com/mycid.html Please, make sure it is for the correct organization if you belong to more than one."} theme={TooltipTheme}/>
                            </h4>
                            <span>
                                <Input
                                    className={classNames(InputTheme.vendor_id_input)}
                                    style={{ color: "#000" }}
                                    theme={InputTheme}
                                    label="Vendor ID"
                                    value={this.state.vendorID}
                                    onChange={this.handleVendorIDChange}
                                    required={true} />
                            </span>
                            <small>To retrieve your vendor ID, <a href="https://developer.amazon.com/mycid.html"
                                target="_blank">click here</a>
                            </small>
                            <Button
                                className={VendorPaneStyle.vendor_button}
                                theme={ButtonTheme}
                                raised={true}
                                primary={true}
                                onClick={this.handleGetStarted}
                                label="Get started"
                                disabled={!this.state.token || !this.state.vendorID} />
                        </div>
                    )}
                    {(
                        <a>
                            <img src="https://bespoken.io/wp-content/uploads/2018/01/Input_Results-AfterToken.jpg" />
                            <div className={VendorPaneStyle.right_backdrop} />
                            <div className={VendorPaneStyle.right_content} >
                                <h3><strong>UNLEASH THE <u>BEAST!</u></strong></h3>
                                <h4>Integrate your Skill with:</h4>
                                <h4>Bespoken Tools</h4>
                                <ul>
                                    <li>- Check your voice application <span>logs</span> and find out errors </li>
                                    <li>- Proactive <span>alerting</span> when there are problems</li>
                                </ul>
                                <div>
                                    <p>We value your time: <strong>5 min set-up</strong></p>
                                    <Button
                                        className={VendorPaneStyle.get_started}
                                        theme={ButtonTheme}
                                        raised={true}
                                        primary={true}
                                        onClick={this.handleGetStarted}
                                        label="Get Started - FREE"/>
                                </div>
                            </div>
                        </a>
                    )}
                </LandingAmazonPageTwoPane>
                {(this.state.loading || !this.props.isParentLoading) && <Loader />}
            </Measure>
        );
    }
}
