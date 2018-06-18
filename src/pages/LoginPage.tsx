import * as React from "react";
import { connect } from "react-redux";
import { AmazonFlowFlag, login, loginWithAmazon, loginWithGithub, resetPassword, setAmazonFlow, signUpWithEmail, SuccessCallback } from "../actions/session";
import AuthForm from "../components/AuthForm/AuthForm";
import { Loader } from "../components/Loader/Loader";
import User from "../models/user";
import { State } from "../reducers";
import auth from "../services/auth";
import SourceService from "../services/source";

/**
 * Configuration objects to pass in to the router when pushing or replacing this page on the router.
 */
export interface LoginConfig {
    /**
     * The next path to go to once logged in.
     */
    nextPathName?: string;
}

interface LoginPageProps {
    login: (email: string, password: string, redirectStrat?: SuccessCallback) => Promise<User>;
    loginWithGithub: (redirectStrat?: SuccessCallback) => Promise<User>;
    loginWithAmazon: (accessToken: string, redirectStrat?: SuccessCallback) => Promise<User>;
    setAmazonFlow: (amazonFlow: boolean) => AmazonFlowFlag;
    signUpWithEmail: (email: string, password: string, confirmPassword: string, redirectStrat?: SuccessCallback) => Promise<User>;
    resetPassword: (email: string) => Promise<void>;
};

interface LoginPageState {
    error?: string;
    loading?: boolean;
    bannerUrl?: string;
    bannerHtml?: string;
}

function mapStateToProps(state: State.All) {
    return {
    };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>) {
    return {
        login: function (email: string, password: string, redirectStrat?: SuccessCallback): Promise<User> {
            return dispatch(login(email, password, redirectStrat));
        },
        setAmazonFlow: function (amazonFlow: boolean): AmazonFlowFlag {
            return dispatch(setAmazonFlow(amazonFlow));
        },
        signUpWithEmail: function (email: string, password: string, confirmPassword: string, redirectStrat?: SuccessCallback): Promise<User> {
            return dispatch(signUpWithEmail(email, password, confirmPassword, redirectStrat));
        },
        loginWithGithub: function (redirectStrat?: SuccessCallback): Promise<User> {
            return dispatch(loginWithGithub(redirectStrat));
        },
        loginWithAmazon: function (accessToken: string, redirectStrat?: SuccessCallback): Promise<User> {
            return dispatch(loginWithAmazon(accessToken, redirectStrat));
        },
        resetPassword: function (email: string): Promise<void> {
            return dispatch(resetPassword(email));
        }
    };
}

export class LoginPage extends React.Component<LoginPageProps, LoginPageState> {

    constructor(props: LoginPageProps) {
        super(props);

        this.handleFormLoginWithGithub = this.handleFormLoginWithGithub.bind(this);
        this.handleFormLoginWithAmazon = this.handleFormLoginWithAmazon.bind(this);
        this.handleFormSignUpWithEmail = this.handleFormSignUpWithEmail.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleResetPassword = this.handleResetPassword.bind(this);

        this.state = {
            bannerHtml: "",
        };
    }

    async componentDidMount () {
        if (window && window.location && window.location.hash) {
            this.setState(() => ({ ...this.state, loading: true }));
            const matches = location.hash.match(new RegExp("access_token" + "=([^&]*)"));
            const accessToken = matches ? matches[1] : undefined;
            setTimeout(async () => {
                await this.props.loginWithAmazon(accessToken);
                this.props.setAmazonFlow(true);
            }, 500);
        }
        const banner = await SourceService.getBanner("communication");
        this.setState(prevState => ({
            ...prevState,
            bannerHtml: banner.htmlstring,
        }));
        if (banner.htmlstring) {
            this.renderCanvas();
        }
    }

    renderCanvas = () => {
        const c: any = document.getElementById("banner-canvas");
        // only start drawing if there is a canvas to draw
        if (c) {
            const ctx = c.getContext("2d");
            // Create gradient
            const grd = ctx.createLinearGradient(0, 0, 200, 0);
            grd.addColorStop(0, "#99d5dd");
            grd.addColorStop(1, "#80C3CC");

            // Create top curve
            ctx.beginPath();
            ctx.moveTo(0, 180);
            ctx.quadraticCurveTo(600, 400, 810, 300);
            ctx.closePath();
            ctx.fillStyle = grd;
            ctx.fill();

            // Create top quadratic fill
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(810, 0);
            ctx.lineTo(810, 301);
            ctx.lineTo(0, 181);
            ctx.closePath();
            ctx.fill();

            // Create bottom curve
            ctx.beginPath();
            ctx.moveTo(0, 1060);
            ctx.quadraticCurveTo(1000, 1000, 810, 1080);
            ctx.closePath();
            ctx.fillStyle = grd;
            ctx.fill();

            // Create bottom quadratic fill
            ctx.beginPath();
            ctx.moveTo(0, 1080);
            ctx.lineTo(810, 1080);
            ctx.lineTo(810, 1080);
            ctx.lineTo(0, 1059);
            ctx.closePath();
            ctx.fill();
        }
    }

    async handleResetPassword(email: string) {
        try {
            if (!email) {
                this.setState(() => ({ ...this.state, error: "Please enter email to reset." }));
            } else {
                await this.props.resetPassword(email);
            }
        } catch (err) {
            this.setState(() => ({ ...this.state, error: err.message }));
        }
    }

    async handleFormSubmit(email: string, pass: string) {
        try {
            await this.props.login(email, pass);
        } catch (err) {
            if (!email || !pass) {
                this.setState(() => ({ ...this.state, error: "Please enter missing information." }));
            } else {
                this.setState(() => ({ ...this.state, error: err.message }));
            }
        }
    }

    async handleFormLoginWithGithub() {
        try {
            await this.props.loginWithGithub();
        } catch (err) {
            this.setState(() => ({ ...this.state, error: err.message }));
        }
    }

    async handleFormLoginWithAmazon(isFromWebsite = false) {
        try {
            const accessToken = await auth.amazonAuthorize(undefined, typeof isFromWebsite === "boolean" ? isFromWebsite : undefined);
            this.setState(() => ({ ...this.state, loading: true }));
            await this.props.loginWithAmazon(accessToken);
            this.props.setAmazonFlow(true);
        } catch (err) {
            this.setState(() => ({ ...this.state, error: err.message, }));
        } finally {
            this.setState(() => ({ ...this.state, loading: false }));
        }
    }

    async handleFormSignUpWithEmail(email: string, pass: string, confirmPass: string) {
        try {
            await this.props.signUpWithEmail(email, pass, confirmPass);

        } catch (err) {
            this.setState(() => ({ ...this.state, error: err.message, }));
        }
    }

    handleBannerButtonClick = async () => {
        window && window.open(this.state.bannerUrl, "_blank");
    }

    handleImageLoaded = () => {
        this.setState(prevState => ({
            ...prevState,
            hasImage: true,
        }));
    }

    handleImageErrored = () => {
        this.setState(prevState => ({
            ...prevState,
            hasImage: false,
        }));
    }

    render() {
        const allProps = this.props as any;
        const location = allProps.location;
        const imageClass = this.state && this.state.bannerHtml ? "" : "no_image";
        return (
            <div className={"global_login_container"}>
                <div className={imageClass}>
                    <AuthForm
                        error={this.state.error}
                        onSubmit={this.handleFormSubmit}
                        onLoginWithGithub={this.handleFormLoginWithGithub}
                        onLoginWithAmazon={this.handleFormLoginWithAmazon}
                        onSignUpWithEmail={this.handleFormSignUpWithEmail}
                        onResetPassword={this.handleResetPassword}
                        location={location} />
                    {this.state.loading && <Loader />}
                </div>
                <div className={imageClass} dangerouslySetInnerHTML={{__html: this.state.bannerHtml}} />
            </div>
        );
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginPage);
