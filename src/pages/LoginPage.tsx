import * as React from "react";
import { connect } from "react-redux";


import { AmazonFlowFlag, login, loginWithAmazon, loginWithGithub, resetPassword, setAmazonFlow, signUpWithEmail, SuccessCallback } from "../actions/session";
import AuthForm from "../components/AuthForm";
import Card from "../components/Card";
import { Cell, Grid } from "../components/Grid";
import User from "../models/user";
import { State } from "../reducers";

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
    loginWithAmazon: (redirectStrat?: SuccessCallback) => Promise<User>;
    setAmazonFlow: (amazonFlow: boolean) => AmazonFlowFlag;
    signUpWithEmail: (email: string, password: string, confirmPassword: string, redirectStrat?: SuccessCallback) => Promise<User>;
    resetPassword: (email: string) => Promise<void>;
};

interface LoginPageState {
    error?: string;
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
        loginWithAmazon: function (redirectStrat?: SuccessCallback): Promise<User> {
            return dispatch(loginWithAmazon(redirectStrat));
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

    handleResetPassword(email: string) {
        this.props.resetPassword(email);
        // Show some feedback in the link
    }

    handleFormSubmit(email: string, pass: string) {
        this.props.login(email, pass)
            .catch((err: Error) => {
                this.state.error = err.message;
                this.setState(this.state);
            });
    }

    handleFormLoginWithGithub() {
        this.props.loginWithGithub()
            .catch((err: Error) => {
                this.state.error = err.message;
                this.setState(this.state);
            });
    }

    async handleFormLoginWithAmazon() {
        try {
            await this.props.loginWithAmazon();
            this.props.setAmazonFlow(true);
        } catch (err) {
            this.state.error = err.message;
            this.setState(this.state);
        }
    }

    handleFormSignUpWithEmail(email: string, pass: string, confirmPass: string) {
        this.props.signUpWithEmail(email, pass, confirmPass)
            .catch((err: Error) => {
                this.state.error = err.message;
                this.setState(this.state);
            });
    }

    render() {
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
                        />
                    </Card>
                </Cell>
                <Cell col={4} tablet={2} hidePhone={true} />
            </Grid>
        );
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginPage);
