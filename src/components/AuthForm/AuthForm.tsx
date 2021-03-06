import * as React from "react";

import { Button } from "react-toolbox/lib/button";
import Input from "react-toolbox/lib/input";

import { Icon, ICON } from "../Icon/index";

const globalWindow: any = typeof (window) !== "undefined" ? window : {};

const theme = require("../../themes/authform.scss");
const authFormStyle = require("./AuthFormStyle.scss");

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

    handleLogoClick = () => {
        globalWindow && globalWindow.location.assign("http://bespoken.io/");
    }

    render() {
        return (
            <div className={authFormStyle.main_form}>
                <div>
                    <img onClick={this.handleLogoClick} src={"https://bespoken.io/wp-content/uploads/2017/07/Bespoken-Alpaca-RGB-social-1.png"} alt={"bespoken isotype"}/>
                    <img src={"https://bespoken.io/wp-content/uploads/2017/07/Bespoken-White.png"} alt={"bespoken logotype"} />
                </div>
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
            <div className={authFormStyle.reset_password_container}>
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

    static svgStyle = {
        width: "2.5rem",
        height: "2.2rem",
        position: "absolute",
        left: 0,
        top: 0,
        padding: ".5rem",
    };

    componentDidMount () {
        if (this.props.location && this.props.location.query && this.props.location.query.github_login === "1") {
            this.props.onLoginWithGithub && this.props.onLoginWithGithub();
        }
    }

    render() {
        return (
            this.props.onLoginWithGithub ? (
                <div className={authFormStyle.github_login_container}>
                    <Button
                        className={authFormStyle.github_login_button}
                        theme={theme}
                        label="Log in with Github"
                        icon={(<Icon style={LoginGithub.svgStyle} color={"#fff"} icon={ICON.GITHUB} />)}
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

    static svgStyle = {
        width: "2rem",
        height: "2rem",
        position: "absolute",
        left: 0,
        top: 0,
        padding: "1rem",
    };

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
                <div>
                    <Button
                        className={authFormStyle.amazon_login_button}
                        theme={theme}
                        label="Log in with Amazon"
                        icon={(<Icon style={LoginAmazon.svgStyle} color={"#fff"} icon={ICON.AMAZON} />)}
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
                    className={authFormStyle.regular_button}
                    theme={theme}
                    label="Submit"
                    onClick={this.onSubmitClicked}
                />
            ) :
            (
                <Button
                    className={authFormStyle.regular_button}
                    theme={theme}
                    label="Register"
                    onClick={this.onSignUpClick} />
            );

        let loginBtn = this.state.isConfirmPassword ?
            (
                <Button
                    className={authFormStyle.regular_button}
                    theme={theme}
                    label="Cancel"
                    onClick={this.onCancelClick} />
            ) :
            (
                <Button
                    className={authFormStyle.regular_button}
                    theme={theme}
                    label="Log in"
                    onClick={this.onLogin} />
            );

        return (
            <div className={authFormStyle.main_normal_login_form}>
                <div>
                    <LoginAmazon onLoginWithAmazon={this.props.onLoginWithAmazon} location={this.props.location}/>
                </div>
                <div className={authFormStyle.or_separation}><span>or</span></div>
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
                    onConfirmPasswordSubmit={this.onFormSubmit}/>
                <div className={`${theme.actions}`}>
                    <PasswordReset
                        onPasswordReset={this.onPasswordReset}/>
                    {loginBtn}
                    {signupBtn}
                </div>
                <div className={`${authFormStyle.or_separation} ${authFormStyle.second}`}><span>or</span></div>
                <div>
                    <LoginGithub onLoginWithGithub={this.props.onLoginWithGithub} location={this.props.location}/>
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
            <div className={authFormStyle.login_inputs_container}>
                <Input
                    floating={false}
                    theme={theme}
                    label="Email Address"
                    type="text"
                    value={this.props.email}
                    onChange={this.props.onEmailChange}
                />
                <Input
                    floating={false}
                    theme={theme}
                    label="Password"
                    type="password"
                    value={this.props.password}
                    onChange={this.props.onPasswordChange}
                    onKeyPress={this.onPasswordKeyPress}
                />
                <Input
                    floating={false}
                    theme={theme}
                    className={this.props.showConfirmPassword ? `${theme.showConfirm} ${theme.active}` : theme.showConfirm}
                    label="Confirm Password"
                    type="password"
                    value={this.props.confirmPassword}
                    onChange={this.props.onConfirmPasswordChange}
                    onKeyPress={this.onPasswordKeyPress}
                />
                <div style={{ color: "#d50000", marginTop: "5px", marginBottom: "10px", textAlign: "center" }}>
                    <label>{this.props.error}</label>
                </div>
            </div>
        );
    }
}
