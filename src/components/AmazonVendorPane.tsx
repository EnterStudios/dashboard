import * as React from "react";
import { AmazonFlowFlag } from "../actions/session";
import { SET_AMAZON_FLOW } from "../constants";
import Source from "../models/source";
import { User, UserDetails } from "../models/user";
import auth from "../services/auth";
import SourceService from "../services/source";

const VendorPaneStyle = require("../themes/amazon_pane.scss");

interface AmazonVendorPaneProps {
    user?: User;
    spacing: boolean;
    setAmazonFlow: (amazonFlow: boolean) => AmazonFlowFlag;
    amazonFlow: boolean;
    goTo?: (path: string) => void;
    sources?: Source[];
    getSources: () => Promise<Source[]>;
    isParentLoading?: boolean;
    setLoading: (value: boolean) => (dispatch: Redux.Dispatch<any>) => void;
}

interface AmazonVendorPaneState {
    myHeight: number;
    vendorID: string;
    token: string;
}

export default class AmazonVendorPane extends React.Component<AmazonVendorPaneProps, AmazonVendorPaneState> {
    static defaultProps: {
        user: undefined,
        spacing: false,
        amazonFlow: true,
        setAmazonFlow: () => { type: SET_AMAZON_FLOW, amazonFlow: true },
        finishLoading: false,
    };
    constructor(props: AmazonVendorPaneProps) {
        super(props);
        this.state = {
            myHeight: 0,
            vendorID: "",
            token: "",
        };
        this.handleVendorIDChange = this.handleVendorIDChange.bind(this);
        this.handleGoClick = this.handleGoClick.bind(this);
        this.handleSkip = this.handleSkip.bind(this);
    }

    async componentDidMount() {
        let userDetails: UserDetails = await auth.currentUserDetails();
        // Only the first time the user clicks the integration we will try to create his sources from amazon.
        if (userDetails && userDetails.smAPIAccessToken && !userDetails.vendorID) {
            this.props.setLoading(true);
            const vendorsId = await SourceService.getVendorIds(userDetails.smAPIAccessToken).catch(err => {
                // if there is something wrong getting the vendor ids (token invalid/expired/not existent) just continue with no sources creation or user update
                return [];
            });
            // for now we default to the first vendorID, later we'll add a way for the user to pick vendor id
            const vendorID = vendorsId && vendorsId.length && vendorsId[0].id;
            if (vendorID) {
                await auth.updateCurrentUser({ vendorID });
                userDetails = await auth.currentUserDetails();
                if (userDetails && userDetails.smAPIAccessToken && userDetails.vendorID) {
                    try {
                        this.props.setLoading(true);
                        await SourceService.createSkillsFromAmazon(this.props.user.userId, userDetails.vendorID, userDetails.smAPIAccessToken);
                        await this.props.getSources();
                        this.props.setLoading(false);
                        this.props.setAmazonFlow(false);
                    } catch (err) {
                        await this.props.getSources();
                        this.props.setLoading(false);
                        this.props.setAmazonFlow(false);
                    }
                } else {
                    this.props.setAmazonFlow(false);
                    this.props.setLoading(false);
                }
            } else {
                this.props.setAmazonFlow(false);
                this.props.setLoading(false);
            }
        }
    }

    url(): string  {
        const baseURL = window.location.origin;
        return `${baseURL}/dashboard`;
    }

    handleVendorIDChange(value: string) {
        this.setState({ ...this.state, vendorID: value });
    }

    handleSkip() {
        this.props.setLoading(true);
        this.props.setAmazonFlow(false);
        this.props.setLoading(false);
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

    handleGoClick () {
        window.location.replace(this.virtualDeviceLinkAccountURL());
    }

    render() {
        return (
            <div className={VendorPaneStyle.global_container}>
                <div className={VendorPaneStyle.main_content}>
                    <div className={VendorPaneStyle.top_text}>Enable permissions for easier setup <small>(1 of 2 successfully completed)</small></div>
                    <div className={VendorPaneStyle.button_container}>
                        <div className={VendorPaneStyle.check}>
                            <span>1.</span>
                            <span>Log in with Amazon<br /><span>We need your permission to retrieve your profile information</span></span>
                        </div>
                        <div className={VendorPaneStyle.second_item}>
                            <span>2.</span>
                            <span>Amazon Permissions<br /><span>Give Bespoken access to your skills for testing and monitoring</span></span>
                            <div onClick={this.handleGoClick}><a href="#">GO</a></div>
                        </div>
                    </div>
                    <small style={{ paddingTop: "0.5rem" }}>
                        <a onClick={this.handleSkip} href="#">skip</a>
                    </small>
                </div>
                <div className={VendorPaneStyle.or_text}>
                    <span>or</span>
                </div>
            </div>
        );
    }
}
