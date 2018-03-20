import * as React from "react";
import { connect } from "react-redux";
import { AmazonFlowFlag, login, loginWithAmazon, loginWithGithub, resetPassword, setAmazonFlow, signUpWithEmail, SuccessCallback } from "../actions/session";
import AuthForm from "../components/AuthForm";
import Card from "../components/Card";
import { Cell, Grid } from "../components/Grid";
import { Loader } from "../components/Loader/Loader";
import User from "../models/user";
import { State } from "../reducers";
import auth from "../services/auth";

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

        this.state = {};
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
    }

    handleResetPassword(email: string) {
        this.props.resetPassword(email);
        // Show some feedback in the link
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

    render() {
        const allProps = this.props as any;
        const location = allProps.location;
        return (
            <Grid style={{ marginTop: "10%" }}>
                <Cell col={4} tablet={2} hidePhone={true} />
                <Cell col={4} tablet={4} phone={4} align={"middle"} style={{ display: "flex", justifyContent: "center" }}>
                    <Card style={{ overflow: "visible" }}>
                        <AuthForm
                            error={this.state.error}
                            onSubmit={this.handleFormSubmit}
                            onLoginWithGithub={this.handleFormLoginWithGithub}
                            onLoginWithAmazon={this.handleFormLoginWithAmazon}
                            onSignUpWithEmail={this.handleFormSignUpWithEmail}
                            onResetPassword={this.handleResetPassword}
                            location={location}
                        />
                    </Card>
                </Cell>
                <Cell col={4} tablet={2} hidePhone={true} />
                {this.state.loading && <Loader />}
            </Grid>
        );
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginPage);
