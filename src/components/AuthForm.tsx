import * as React from "react";

import { Button } from "react-toolbox/lib/button";
import Input from "react-toolbox/lib/input";

import { Icon, ICON } from "./Icon";

const theme = require("../themes/authform.scss");

export interface AuthFormProps {
    error?: string;
    onSubmit: (email: string, pass: string) => void;
    onLoginWithGithub?: () => void;
    onLoginWithAmazon?: () => void;
    onSignUpWithEmail?: (email: string, pass: string, confirmPass: string) => void;
    onResetPassword?: (email: string) => void;
    location?: any;
}

export interface AuthFormState {
    email: string;
    isConfirmPasswordVisible?: boolean;
}

export class AuthForm extends React.Component<AuthFormProps, AuthFormState> {

    constructor(props: AuthFormProps) {
        super(props);
        this.state = {
            email: "",
            isConfirmPasswordVisible: false
        };

        this.onEmailChange = this.onEmailChange.bind(this);
        this.onResetPassword = this.onResetPassword.bind(this);
    }

    onRegister() {
        this.state.isConfirmPasswordVisible = true;
        this.setState(this.state);
    }

    onEmailChange(email: string) {

    }

    onResetPassword(email: string) {
        if (this.props.onResetPassword) {
            this.props.onResetPassword(email);
        }
    }

    render() {
        return (
            <div className="mdl-card__supporting-text">
                <img style={{ width: "65%", margin: "0 17.5%" }} src="https://bespoken.io/wp-content/uploads/Bespoken-Logo-RGB-e1500333659572.png" alt="bespoken logo" />

                <NormalLoginForm
                    error={this.props.error}
                    onLogin={this.props.onSubmit}
                    onSignUpWithEmail={this.props.onSignUpWithEmail}
                    onEmailChange={this.onEmailChange}
                    onResetPassword={this.onResetPassword}
                    onLoginWithAmazon={this.props.onLoginWithAmazon}
                    onLoginWithGithub={this.props.onLoginWithGithub}
                    location={this.props.location}
                />
            </div>
        );
    }
}

export default AuthForm;

interface PasswordResetProps {
    onPasswordReset: () => void;
}

export class PasswordReset extends React.Component<PasswordResetProps, any> {
    render() {
        return (
            <div style={{ position: "absolute", top: "103%" }}>
                <Button
                    label="Reset Password"
                    onClick={this.props.onPasswordReset}
                    style={{ float: "right", height: "16px", fontSize: "12px", color: "#03A9F4", textTransform: "none", lineHeight: "12px" }} />
            </div>
        );
    }
}

interface LoginGithubProps {
    onLoginWithGithub?: () => void;
    location?: any;
}

export class LoginGithub extends React.Component<LoginGithubProps, any> {

    componentDidMount () {
        if (this.props.location && this.props.location.query && this.props.location.query.github_login === "1") {
            this.props.onLoginWithGithub && this.props.onLoginWithGithub();
        }
    }

    render() {
        return (
            this.props.onLoginWithGithub ? (
                <div style={{ width: "100%", textAlign: "Center" }}>
                    <Button
                        style={{ width: "92%" }}
                        theme={theme}
                        label="Login with Github"
                        icon={(<Icon style={{ marginRight: "13px" }} width={20} height={20} icon={ICON.GITHUB} />)}
                        onClick={this.props.onLoginWithGithub} />
                </div>
            ) : (<div />)
        );
    }
}

interface LoginAmazonProps {
    onLoginWithAmazon?: (isFromWebsite: boolean) => void;
    location?: any;
}

export class LoginAmazon extends React.Component<LoginAmazonProps, any> {

    componentDidMount () {
        if (this.props.location && this.props.location.query && this.props.location.query.amazon_login === "1") {
            // waiting for amazon script to load
            setTimeout(() => {
                this.props.onLoginWithAmazon && this.props.onLoginWithAmazon(true);
            }, 1000);
        }
    }

    render() {
        return (
            this.props.onLoginWithAmazon ? (
                <div style={{ width: "100%", textAlign: "Center" }}>
                    <Button
                        style={{ width: "92%" }}
                        theme={theme}
                        label="Login with Amazon"
                        icon={(<Icon style={{ marginRight: "7px" }} width={20} height={20} icon={ICON.AMAZON} />)}
                        onClick={this.props.onLoginWithAmazon} />
                </div>
            ) : (<div />)
        );
    }
}

export interface NormalLoginFormProps {
    onEmailChange: (email: string) => void;
    onLogin: (email: string, pass: string) => void;
    onSignUpWithEmail: (email: string, pass: string, confirmPass: string) => void;
    onResetPassword: (email: string) => void;
    error?: string;
    onLoginWithGithub?: () => void;
    onLoginWithAmazon?: (isFromWebsite: boolean) => void;
    location?: any;
}

interface NormalLoginFormState {
    error?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    isConfirmPassword?: boolean;
}

export class NormalLoginForm extends React.Component<NormalLoginFormProps, NormalLoginFormState> {

    constructor(props: NormalLoginFormProps) {
        super(props);
        this.state = {
            error: props.error
        };

        this.onEmailChange = this.onEmailChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.onConfirmPassChange = this.onConfirmPassChange.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.onSignUpClick = this.onSignUpClick.bind(this);
        this.onSubmitClicked = this.onSubmitClicked.bind(this);
        this.onCancelClick = this.onCancelClick.bind(this);
        this.onPasswordReset = this.onPasswordReset.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps: NormalLoginFormProps, ctx: any) {
        this.state.error = nextProps.error;
        this.setState(this.state);
    }

    onEmailChange(value: string) {
        this.state.email = value;
        this.setState(this.state);
        if (this.props.onEmailChange) {
            this.props.onEmailChange(value);
        }
    }

    onPasswordChange(value: string) {
        this.state.password = value;
        this.setState(this.state);
    }

    onConfirmPassChange(value: string) {
        this.state.confirmPassword = value;
        this.setState(this.state);
    }

    onLogin() {
        let email = this.state.email;
        let pass = this.state.password;
        this.state.password = "";
        this.state.confirmPassword = "";
        this.state.error = "";
        this.setState(this.state);

        this.props.onLogin(email, pass);
    }

    onSignUpClick() {
        this.state.confirmPassword = "";
        this.state.isConfirmPassword = true;
        this.setState(this.state);
    }

    onCancelClick() {
        this.state.confirmPassword = "";
        this.state.isConfirmPassword = false;
        this.setState(this.state);
    }

    onSubmitClicked() {
        let email = this.state.email;
        let pass = this.state.password;
        let confirmPass = this.state.confirmPassword;
        let match = pass === confirmPass;

        this.state.password = "";
        this.state.confirmPassword = "";

        this.state.error = (match) ? "" : "Passwords do not match.";

        this.setState(this.state);

        if (match) {
            this.props.onSignUpWithEmail(email, pass, confirmPass);
        }
    }

    onPasswordReset() {
        this.props.onResetPassword(this.state.email);
    }

    onFormSubmit() {
        if (this.state.isConfirmPassword) {
            this.onSubmitClicked();
        } else {
            this.onLogin();
        }
    }

    render() {
        let signupBtn = this.state.isConfirmPassword ?
            (
                <Button
                    theme={theme}
                    label="Submit"
                    onClick={this.onSubmitClicked}
                />
            ) :
            (
                <Button
                    theme={theme}
                    label="Register"
                    onClick={this.onSignUpClick} />
            );

        let loginBtn = this.state.isConfirmPassword ?
            (
                <Button
                    theme={theme}
                    label="Cancel"
                    onClick={this.onCancelClick} />
            ) :
            (
                <Button
                    theme={theme}
                    label="Login"
                    onClick={this.onLogin} />
            );

        return (
            <div>
                <LoginForms
                    email={this.state.email}
                    password={this.state.password}
                    confirmPassword={this.state.confirmPassword}
                    showConfirmPassword={this.state.isConfirmPassword}
                    error={this.state.error}
                    onEmailChange={this.onEmailChange}
                    onPasswordChange={this.onPasswordChange}
                    onConfirmPasswordChange={this.onConfirmPassChange}
                    onPasswordSubmit={this.onFormSubmit}
                    onConfirmPasswordSubmit={this.onFormSubmit} />
                <div className="mdl-card__actions clearfix">
                    <LoginAmazon onLoginWithAmazon={this.props.onLoginWithAmazon} location={this.props.location} />
                </div>
                <div className="mdl-card__actions clearfix">
                    <LoginGithub onLoginWithGithub={this.props.onLoginWithGithub} location={this.props.location} />
                </div>
                <div className={`${theme.actions} mdl-card__actions clearfix`}>
                    {loginBtn}
                    {signupBtn}
                    <PasswordReset
                        onPasswordReset={this.onPasswordReset} />
                </div>
            </div>
        );
    }
}

export interface LoginFormsProps {
    email: string;
    password: string;
    confirmPassword: string;
    error: string;
    showConfirmPassword: boolean;
    onEmailChange: (newText: string) => void;
    onPasswordChange: (newText: string) => void;
    onConfirmPasswordChange: (newText: string) => void;
    onPasswordSubmit: () => void;
    onConfirmPasswordSubmit: () => void;
}

interface LoginFormsState {
}

export class LoginForms extends React.Component<LoginFormsProps, LoginFormsState> {

    constructor(props: LoginFormsProps) {
        super(props);

        this.onPasswordKeyPress = this.onPasswordKeyPress.bind(this);
        this.onConfirmPasswordKeyPress = this.onPasswordKeyPress.bind(this);
    }

    onConfirmPasswordKeyPress(event: any) {
        this.onKeyPress("confirmPassword", event);
    }

    onPasswordKeyPress(event: any) {
        this.onKeyPress("password", event);
    }

    onKeyPress(name: string, event: any) {
        if (event.charCode === 13) {
            if (name === "password") {
                this.props.onPasswordSubmit();
            } else if (name === "confirmPassword") {
                this.props.onConfirmPasswordSubmit();
            }
        }
    }

    render() {
        return (
            <div>
                {
                    this.props.showConfirmPassword ?
                        <h3 className={theme.h3}>Create New Account</h3> :
                        ""
                }
                <Input
                    theme={theme}
                    label="Email"
                    type="text"
                    value={this.props.email}
                    onChange={this.props.onEmailChange}
                />
                <Input
                    theme={theme}
                    label="Password"
                    type="password"
                    value={this.props.password}
                    onChange={this.props.onPasswordChange}
                    onKeyPress={this.onPasswordKeyPress}
                />
                <Input
                    theme={theme}
                    className={this.props.showConfirmPassword ? `${theme.showConfirm} ${theme.active}` : theme.showConfirm}
                    label="Confirm Password"
                    type="password"
                    value={this.props.confirmPassword}
                    onChange={this.props.onConfirmPasswordChange}
                    onKeyPress={this.onPasswordKeyPress}
                />
                <div style={{ color: "#d50000", marginTop: "5px", marginBottom: "10px" }}>
                    <label>{this.props.error}</label>
                </div>
            </div>
        );
    }
}
