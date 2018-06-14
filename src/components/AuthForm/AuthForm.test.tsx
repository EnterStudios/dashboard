import * as chai from "chai";
import { shallow, ShallowWrapper } from "enzyme";
import * as React from "react";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import { AuthForm, LoginAmazon, LoginForms, LoginGithub, NormalLoginForm, PasswordReset } from "./AuthForm";

// Setup chai with sinon-chai
chai.use(sinonChai);
let expect = chai.expect;

describe("AuthForm", function () {
    it("renders the basics", function () {
        const onSubmit = sinon.spy();
        const wrapper = shallow(<AuthForm onSubmit={onSubmit} />);
        // A form, two inputs and a button
        expect(wrapper.find("NormalLoginForm")).to.have.length(1);
    });

    it("Tests top level callback for submit", function () {
        const onSubmit = sinon.spy();
        const wrapper = shallow(<AuthForm onSubmit={onSubmit} />);

        wrapper.find("NormalLoginForm").first().simulate("login");
        expect(onSubmit).to.have.been.calledOnce;
    });

    it("Tests top level callback for sign up with email", function () {
        const onSignUpWithEmail = sinon.spy();
        const onSubmit = sinon.spy();
        const wrapper = shallow((
            <AuthForm onSubmit={onSubmit}
                onSignUpWithEmail={onSignUpWithEmail} />
        ));

        wrapper.find("NormalLoginForm").simulate("SignUpWithEmail");
        expect(onSignUpWithEmail).to.have.been.calledOnce;
    });

    it("Tests top level callback for login with github", function () {
        const onSubmit = sinon.spy();
        const onLoginWithGithub = sinon.spy();
        const wrapper = shallow((
            <AuthForm
                onSubmit={onSubmit}
                onLoginWithGithub={onLoginWithGithub} />
        ));
        wrapper.find("NormalLoginForm").simulate("loginWithGithub");
        expect(onLoginWithGithub).to.have.been.calledOnce;
    });

    it("Top level callback for reset password.", function () {
        const onSubmit = sinon.spy();
        const onResetPassword = sinon.spy();
        const wrapper = shallow((
            <AuthForm
                onSubmit={onSubmit}
                onResetPassword={onResetPassword} />
        ));

        wrapper.find("NormalLoginForm").simulate("resetPassword");
        expect(onResetPassword).to.have.been.calledOnce;
    });

    describe("Password Reset Button", function () {

        it("Renders", function () {
            const onPasswordReset = sinon.spy();

            const wrapper = shallow((
                <PasswordReset
                    onPasswordReset={onPasswordReset} />
            ));

            // The "Button" class compiles down to a "Themed" class because it's heavily styled.
            expect(wrapper.find("Themed")).to.have.length(1);
        });

        it("Tests the callback is thrown on click.", function () {
            const onPasswordReset = sinon.spy();

            const wrapper = shallow((
                <PasswordReset
                    onPasswordReset={onPasswordReset} />
            ));

            // The "Button" class compiles down to a "Themed" class because it's heavily styled.
            wrapper.find("Themed").first().simulate("click");
            expect(onPasswordReset).to.have.been.calledOnce;
        });
    });

    describe("Login Github button", function () {

        it("Renders properly,", function () {
            const onLoginWithGithub = sinon.spy();
            const wrapper = shallow((
                <LoginGithub
                    onLoginWithGithub={onLoginWithGithub} />
            ));

            // The "Button" class compiles down to a "Themed" class because it's heavily styled.
            expect(wrapper.find("Themed")).to.have.length(1);
        });

        it("Renders properly without callback.", function () {
            const wrapper = shallow((
                <LoginGithub />
            ));

            expect(wrapper.find("Themed")).to.have.length(0);
        });

        it("Tests the clalback is thrown on click.", function () {
            const onLoginWithGithub = sinon.spy();
            const wrapper = shallow((
                <LoginGithub
                    onLoginWithGithub={onLoginWithGithub} />
            ));

            // The "Button" class compiles down to a "Themed" class because it's heavily styled.
            wrapper.find("Themed").simulate("click");
            expect(onLoginWithGithub).to.have.been.calledOnce;
        });
    });

    describe("Normal Login Form", function () {

        const onEmailChange = sinon.spy();
        const onLogin = sinon.spy();
        const onResetPassword = sinon.spy();
        const onSignUpWithEmail = sinon.spy();

        let wrapper: ShallowWrapper<any, any>;

        beforeEach(function () {
            wrapper = shallow((
                <NormalLoginForm
                    error="Error"
                    onEmailChange={onEmailChange}
                    onLogin={onLogin}
                    onResetPassword={onResetPassword}
                    onSignUpWithEmail={onSignUpWithEmail} />
            ));
        });

        afterEach(function () {
            onEmailChange.reset();
            onLogin.reset();
            onResetPassword.reset();
            onSignUpWithEmail.reset();
        });

        it("Renders properly.", function () {
            expect(wrapper.find("LoginForms")).to.have.length(1);
            expect(wrapper.find("Themed")).to.have.length(2);
            expect(wrapper.find("PasswordReset")).to.have.length(1);
            expect(wrapper.find(LoginGithub)).to.have.length(1);
            expect(wrapper.find(LoginAmazon)).to.have.length(1);

            let loginForm = wrapper.find("LoginForms").first();

            expect(loginForm.prop("error")).to.equal("Error");

            let loginBtn = wrapper.find("Themed").first();

            expect(loginBtn.prop("label")).to.equal("Log in");

            // hiding register button for now according to specs
            // let signUpBtn = wrapper.find("Themed").at(1);
            // expect(signUpBtn.prop("label")).to.equal("Register");
        });

        describe("With filled state.", function () {

            const state = {
                error: "New Error",
                email: "test@test.com",
                password: "1234ABC",
                confirmPassword: "ABC1234",
                isConfirmPassword: true
            };

            beforeEach(function () {
                wrapper.setState(state);
            });

            it("Renders properly with filled state.", function () {
                expect(wrapper.find("LoginForms")).to.have.length(1);
                expect(wrapper.find("Themed")).to.have.length(2);
                expect(wrapper.find("PasswordReset")).to.have.length(1);

                let loginForm = wrapper.find("LoginForms").first();

                expect(loginForm.prop("email")).to.equal("test@test.com");
                expect(loginForm.prop("password")).to.equal("1234ABC");
                expect(loginForm.prop("confirmPassword")).to.equal("ABC1234");
                expect(loginForm.prop("showConfirmPassword")).to.be.true;
                expect(loginForm.prop("error")).to.equal("New Error");

                let loginBtn = wrapper.find("Themed").first();

                expect(loginBtn.prop("label")).to.equal("Cancel");

                // hidding register button for now according to specs
                // let signUpBtn = wrapper.find("Themed").at(1);
                // expect(signUpBtn.prop("label")).to.equal("Submit");
            });

            it("Throws callback and state for onEmailChange.", function () {
                wrapper.find("LoginForms").simulate("emailChange", "newtest@test.com");
                expect(onEmailChange).to.be.calledOnce;
                expect(onEmailChange).to.be.calledWith("newtest@test.com");

                expect(wrapper.state("email")).to.equal("newtest@test.com");
            });

            it("Sets state on password change.", function () {
                wrapper.find("LoginForms").simulate("passwordChange", "new Password");

                expect(wrapper.state("password")).to.equal("new Password");
            });

            it("Sets state on confirm password change.", function () {
                wrapper.find("LoginForms").simulate("confirmPasswordChange", "New Confirmation Password");

                expect(wrapper.state("confirmPassword")).to.equal("New Confirmation Password");
            });

            it("Sets state on password submit with mismatched passwords.", function () {
                wrapper.find("LoginForms").simulate("passwordSubmit");
                // Showing form submit.
                expect(wrapper.state("error")).to.equal("Passwords do not match.");
                expect(wrapper.state("password")).to.equal("");
                expect(wrapper.state("confirmPassword")).to.equal("");
            });

            it("Throws callback and sets state on password submit with matching passwords.", function () {
                let newState = { ...state, ...{ confirmPassword: state.password } };
                wrapper.setState(newState);
                wrapper.find("LoginForms").simulate("passwordSubmit");
                // Showing form submit.
                expect(wrapper.state("error")).to.equal("");
                expect(wrapper.state("password")).to.equal("");
                expect(wrapper.state("confirmPassword")).to.equal("");
                expect(onSignUpWithEmail).to.have.been.calledOnce;
                expect(onSignUpWithEmail).to.have.been.calledWith(state.email, newState.password, newState.confirmPassword);
            });

            it("Throws login and sets state when not showing confirm password.", function () {
                let newState = { ...state, ...{ confirmPassword: "", isConfirmPassword: false } };
                wrapper.setState(newState);
                wrapper.find("LoginForms").simulate("passwordSubmit");

                // Showing form submit.
                expect(wrapper.state("error")).to.equal("");
                expect(wrapper.state("password")).to.equal("");
                expect(wrapper.state("confirmPassword")).to.equal("");
                expect(onLogin).to.have.been.calledOnce;
                expect(onLogin).to.have.been.calledWith(state.email, state.password);
            });

            it("Updates state on new props.", function () {
                wrapper.setProps({
                    error: "New Error"
                });

                expect(wrapper.state("error")).to.equal("New Error");
            });
        });
    });

    describe("LoginForms", function () {
        const onEmailChange = sinon.spy();
        const onPasswordChange = sinon.spy();
        const onConfirmPasswordChange = sinon.spy();
        const onPasswordSubmit = sinon.spy();
        const onConfirmPasswordSubmit = sinon.spy();

        let wrapper: ShallowWrapper<any, any>;

        beforeEach(function () {
            wrapper = shallow((
                <LoginForms
                    email="test@test.com"
                    password="ABCD1234"
                    confirmPassword="1234ABCD"
                    error="Error"
                    showConfirmPassword={true}
                    onEmailChange={onEmailChange}
                    onPasswordChange={onPasswordChange}
                    onConfirmPasswordChange={onConfirmPasswordChange}
                    onPasswordSubmit={onPasswordSubmit}
                    onConfirmPasswordSubmit={onConfirmPasswordSubmit} />
            ));
        });

        it("Renders properly.", function () {
            // expect(wrapper.find("h3")).to.have.length(1);
            expect(wrapper.find("Themed")).to.have.length(3);
            expect(wrapper.find("label")).to.have.length(1);

            let title = wrapper.find("h3").at(0);
            expect(title.text()).to.equal("");

            let emailInput = wrapper.find("Themed").at(0);
            expect(emailInput.prop("label")).to.equal("Email Address");
            expect(emailInput.prop("type")).to.equal("text");
            expect(emailInput.prop("value")).to.equal("test@test.com");

            let passInput = wrapper.find("Themed").at(1);
            expect(passInput.prop("label")).to.equal("Password");
            expect(passInput.prop("type")).to.equal("password");
            expect(passInput.prop("value")).to.equal("ABCD1234");

            let confirmPassInput = wrapper.find("Themed").at(2);
            expect(confirmPassInput.prop("label")).to.equal("Confirm Password");
            expect(confirmPassInput.prop("type")).to.equal("password");
            expect(confirmPassInput.prop("value")).to.equal("1234ABCD");

            let errorLabel = wrapper.find("label").at(0);
            expect(errorLabel.text()).to.equal("Error");
        });

        it("Renders properly without confirm password field.", function () {
            wrapper.setProps({ showConfirmPassword: false });

            expect(wrapper.find("h3")).to.have.length(0);
            expect(wrapper.find("Themed")).to.have.length(3);

            let title = wrapper.find("h3").at(0);
            expect(title.text()).to.equal("");

            let emailInput = wrapper.find("Themed").at(0);
            expect(emailInput.prop("label")).to.equal("Email Address");
            expect(emailInput.prop("type")).to.equal("text");
            expect(emailInput.prop("value")).to.equal("test@test.com");

            let passInput = wrapper.find("Themed").at(1);
            expect(passInput.prop("label")).to.equal("Password");
            expect(passInput.prop("type")).to.equal("password");
            expect(passInput.prop("value")).to.equal("ABCD1234");
        });

        it("Throws the callback on email change.", function () {
            wrapper.find("Themed").at(0).simulate("change", "newEmail@test.com");
            expect(onEmailChange).to.be.calledOnce;
            expect(onEmailChange).to.be.calledWith("newEmail@test.com");
        });

        it("Throws the callback on password change.", function () {
            wrapper.find("Themed").at(1).simulate("change", "new password");
            expect(onPasswordChange).to.be.calledOnce;
            expect(onPasswordChange).to.be.calledWith("new password");
        });

        it ("Throws the callback on password submit.", function () {
            wrapper.find("Themed").at(1).simulate("keyPress", {charCode: 13});
            expect(onPasswordSubmit).to.be.calledOnce;
        });

        it ("Throws the callback on confirm password change.", function () {
            wrapper.find("Themed").at(2).simulate("change", "new confirm password");
            expect(onConfirmPasswordChange).to.be.calledOnce;
            expect(onConfirmPasswordChange).to.be.calledWith("new confirm password");
        });

        it ("Throws the callback on confirm password submit.", function () {
            wrapper.find("Themed").at(2).simulate("keyPress", {charCode: 13});
            expect(onConfirmPasswordChange).to.be.calledOnce;
        });
    });
});
