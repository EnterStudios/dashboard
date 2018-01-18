import * as chai from "chai";
import { replace } from "react-router-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import * as sinon from "sinon";

import { AUTH_FORM_ERROR, SET_AMAZON_FLOW, SET_SNACKBAR_MESSAGE, SET_USER } from "../constants";
import User from "../models/user";
import auth from "../services/auth";
import * as session from "./session";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let expect = chai.expect;

let user = new User({
    email: "test@test.com",
    displayName: "TestyMcTestFace",
    photoUrl: undefined
});

/**
 * In the olden days, session.ts allowed for an override of the success callback to allow movement around the
 * app.  That's all taken care of now at a higher level, but this is still a useful callback, so this has been
 * taken out of session.ts and moved in to the tests to ensure they still work.
 *
 * It also helps to not have to rewrite all the tests.  They already verified that the callback is used (by testing dispatch);
 */
class ToPathCallback implements session.SuccessCallback {
    toPath: string;

    public constructor(toPath: string) {
        this.toPath = toPath;
    }

    loginSuccess(dispatch: Redux.Dispatch<any>, user: User): void {
        dispatch(replace(this.toPath));
    }
}

describe("Session.ts", function () {
    describe("Session Actions", function () {
        it("sets the user", function () {
            let user = new User({ email: "email" });
            let initialState = {};

            let store = mockStore(initialState);
            store.dispatch(session.setUser(user));

            expect(store.getActions().length).to.equal(1);
            let action: any = store.getActions()[0];
            expect(action.type).to.equal(SET_USER);
        });

        it("sets the Amazon flow flag", function () {
            const initialState = {};

            const store = mockStore(initialState);
            store.dispatch(session.setAmazonFlow(true));

            expect(store.getActions().length).to.equal(1);
            const action: any = store.getActions()[0];
            expect(action.type).to.equal(SET_AMAZON_FLOW);
        });
    });

    describe("Successful login With Github", function () {

        let loginGithubStub: sinon.SinonStub;
        let setUserStub: sinon.SinonStub;

        before("Stubbing auth namespace.", function () {
            loginGithubStub = sinon.stub(auth, "loginWithGithub").returns(new Promise<User>((resolve, reject) => {
                resolve(user);
            }));

            setUserStub = sinon.stub(auth, "user", () => {
                return new User({ email: "testEmail" });
            });
        });

        after(function () {
            loginGithubStub.restore();
            setUserStub.restore();
        });

        it("Tests the login flow works properly on a successful github login with a default login strategy.", function () {
            return verifySuccessLogin(undefined, session.loginWithGithub());
        });

        it("Tests the login flow works properly on successful github login with overridden login strategy.", function () {
            return verifySuccessLogin("/NextPath", session.loginWithGithub(new ToPathCallback("/NextPath")));
        });
    });

    describe("Successful login With Amazon", function () {

        let loginAmazonStub: sinon.SinonStub;
        let setUserStub: sinon.SinonStub;

        before("Stubbing auth namespace.", function () {
            loginAmazonStub = sinon.stub(auth, "loginWithAmazon").returns(new Promise<User>((resolve, reject) => {
                resolve(user);
            }));

            setUserStub = sinon.stub(auth, "user", () => {
                return new User({ email: "testEmail" });
            });
        });

        after(function () {
            loginAmazonStub.restore();
            setUserStub.restore();
        });

        it("Tests the login flow works properly on a successful amazon login with a default login strategy.", function () {
            return verifySuccessLogin(undefined, session.loginWithAmazon());
        });

        it("Tests the login flow works properly on successful amazon login with overridden login strategy.", function () {
            return verifySuccessLogin("/NextPath", session.loginWithAmazon(new ToPathCallback("/NextPath")));
        });
    });

    describe("Successful login with username and password", function () {

        let loginStub: sinon.SinonStub;
        let setUserStub: sinon.SinonStub;

        before("Stubbing auth namespace.", function () {
            loginStub = sinon.stub(auth, "login").returns(new Promise<User>((resolve, reject) => {
                resolve(user);
            }));

            setUserStub = sinon.stub(auth, "user", () => {
                return new User({ email: "testEmail" });
            });
        });

        after(function () {
            loginStub.restore();
            setUserStub.restore();
        });

        it("Tests the login flow works properly on a successful username and password login with a default login strategy.", function () {
            return verifySuccessLogin(undefined, session.login("testuser", "secretPassword"));
        });

        it("Tests the login flow works properly on successful username and password login with overridden login strategy.", function () {
            return verifySuccessLogin("/NextPath", session.login("testuser", "secretPassword", new ToPathCallback("/NextPath")));
        });
    });

    describe("Successful signUpWithEmail with username and password", function () {

        let signUpWithEmail: sinon.SinonStub;
        let setUserStub: sinon.SinonStub;

        before("Stubbing auth namespace.", function () {
            signUpWithEmail = sinon.stub(auth, "signUpWithEmail").returns(new Promise<any>((resolve, reject) => {
                resolve(true);
            }));

            setUserStub = sinon.stub(auth, "user", () => {
                return new User({ email: "testEmail" });
            });
        });

        after(function () {
            signUpWithEmail.restore();
            setUserStub.restore();
        });

        it("Tests the signUpWithEmail flow works properly on a successful username and password signUpWithEmail with a default signUpWithEmail strategy.", function () {
            return verifySuccessLogin(undefined, session.signUpWithEmail("testuser", "secretPassword", "secretPassword"));
        });

        it("Tests the signUpWithEmail flow works properly on successful username and password signUpWithEmail with overridden signUpWithEmail strategy.", function () {
            return verifySuccessLogin("/NextPath", session.signUpWithEmail("testuser", "secretPassword", "secretPassword", new ToPathCallback("/NextPath")));
        });
    });

    describe("Unsuccessful signUpWithEmail with username and password", function () {
        let signUpWithEmail: sinon.SinonStub;
        let setUserStub: sinon.SinonStub;

        before("Stubbing auth namespace.", function () {
            signUpWithEmail = sinon.stub(auth, "signUpWithEmail").returns(new Promise<any>((resolve, reject) => {
                reject(new Error("Error failed do to requirements of the test."));
            }));

            setUserStub = sinon.stub(auth, "user", (): User => {
                return undefined;
            });
        });

        after(function () {
            signUpWithEmail.restore();
            setUserStub.restore();
        });

        it("Tests the login flow works properly on an unsuccessful signUpWithEmail attempt.", function () {
            return verifyUnsuccessfullLogin(session.signUpWithEmail("testAccount", "12345-", "12345-the-kind-of-password-an-idiot-would-have-on-his-luggage"));
        });
    });

    describe("Unsuccessful login with Github", function () {
        let loginStub: sinon.SinonStub;
        let setUserStub: sinon.SinonStub;

        before("Stubbing auth namespace.", function () {
            loginStub = sinon.stub(auth, "loginWithGithub").returns(new Promise<any>((resolve, reject) => {
                reject(new Error("Error failed do to requirements of the test."));
            }));

            setUserStub = sinon.stub(auth, "user", (): User => {
                return undefined;
            });
        });

        after(function () {
            loginStub.restore();
            setUserStub.restore();
        });

        it("Tests the login flow works properly on an unsuccessful login attempt.", function () {
            return verifyUnsuccessfullLogin(session.loginWithGithub());
        });
    });

    describe("Unsuccessful login with Amazon", function () {
        let loginStub: sinon.SinonStub;
        let setUserStub: sinon.SinonStub;

        before("Stubbing auth namespace.", function () {
            loginStub = sinon.stub(auth, "loginWithAmazon").returns(new Promise<any>((resolve, reject) => {
                reject(new Error("Error failed do to requirements of the test."));
            }));

            setUserStub = sinon.stub(auth, "user", (): User => {
                return undefined;
            });
        });

        after(function () {
            loginStub.restore();
            setUserStub.restore();
        });

        it("Tests the login flow works properly on an unsuccessful login attempt.", function () {
            return verifyUnsuccessfullLogin(session.loginWithAmazon());
        });
    });

    describe("Unsuccessful login with username and password", function () {
        let loginStub: sinon.SinonStub;
        let setUserStub: sinon.SinonStub;

        before("Stubbing auth namespace.", function () {
            loginStub = sinon.stub(auth, "login").returns(new Promise<any>((resolve, reject) => {
                reject(new Error("Error failed do to requirements of the test."));
            }));

            setUserStub = sinon.stub(auth, "user", (): User => {
                return undefined;
            });
        });

        after(function () {
            loginStub.restore();
            setUserStub.restore();
        });

        it("Tests the login flow works properly on an unsuccessful login attempt.", function () {
            return verifyUnsuccessfullLogin(session.login("testAccount@test.com", "12345-the-kind-of-password-an-idiot-would-have-on-his-luggage"));
        });
    });

    describe("Logout", function () {
        let logoutStub: sinon.SinonStub;

        beforeEach("Stubbing auth logout.", function () {
            logoutStub = sinon.stub(auth, "logout").returns(new Promise<any>((resolve, reject) => {
                resolve("Can be anything.");
            }));
        });

        afterEach(function () {
            logoutStub.restore();
        });

        it("Verifies a successful logout actions with callback", function (done: MochaDone) {
            let initialState = {};
            let store = mockStore(initialState);

            store.dispatch(session.logout(function (success: boolean) {
                expect(success).to.be.true;
                done();
            }));
        });

        it("Verifies a successful logout actions with Promise", function () {
            let initialState = {};
            let store = mockStore(initialState);

            // Error will be thrown in the promise if something went up.
            return store.dispatch(session.logout());
        });

        it("Verifies an unsuccessful logout action with callback.", function (done: MochaDone) {
            logoutStub.restore();
            logoutStub = sinon.stub(auth, "logout").returns(new Promise<any>((resolve, reject) => {
                reject(new Error("Error per requirement of the test."));
            }));
            let initialState = {};
            let store = mockStore(initialState);

            store.dispatch(session.logout(function (success: boolean) {
                expect(success).to.be.false;
                expect(store.getActions().length).to.equal(0);
                logoutStub.restore();
                done();
            }));
        });

        it("Verifies an unsuccessful logout action with promise.", function () {
            logoutStub.restore();
            logoutStub = sinon.stub(auth, "logout").returns(new Promise<any>((resolve, reject) => {
                reject(new Error("Error per requirement of the test."));
            }));
            let initialState = {};
            let store = mockStore(initialState);

            return store.dispatch(session.logout()).then(function () {
                expect(store.getActions().length).to.equal(0);
                logoutStub.restore();
            }).catch(function (err: Error) {
                logoutStub.restore();
                throw err;
            });
        });
    });

    describe("resetPassword", function () {

        let sendResetPasswordEmailStub: sinon.SinonStub;

        let successPromise = new Promise((resolve, reject) => {
            resolve("Success");
        });

        let failPromise = new Promise((resolve, reject) => {
            reject(new Error("Failure do to requirements of the test."));
        });

        afterEach(function () {
            sendResetPasswordEmailStub.restore();
        });

        it("sets snackbar on success", function (done: MochaDone) {

            let initialState = {};
            let store = mockStore(initialState);

            sendResetPasswordEmailStub = sinon.stub(auth, "sendResetPasswordEmail").returns(successPromise);

            store.dispatch(session.resetPassword("test@email.com", function (success: boolean) {
                let actions: any[] = store.getActions();
                expect(success).to.be.true;
                expect(actions.length).to.equal(1);
                expect(actions[0].type).to.equal(SET_SNACKBAR_MESSAGE);
                expect(actions[0].message).to.equal("Check your inbox!");
                done();
            }));
        });

        it("passes through the error on failure", function (done: MochaDone) {

            let initialState = {};
            let store = mockStore(initialState);

            sendResetPasswordEmailStub = sinon.stub(auth, "sendResetPasswordEmail").returns(failPromise);

            store.dispatch(session.resetPassword("test@email.com", function (success: boolean) {
                let actions: any[] = store.getActions();
                expect(success).to.be.false;
                expect(actions.length).to.equal(1);
                expect(actions[0].type).to.equal(AUTH_FORM_ERROR);
                expect(actions[0].error).to.equal("Failure do to requirements of the test.");
                done();
            }));
        });
    });

    function verifySuccessLogin(redirectPath: string, loginAction: (dispatch: Redux.Dispatch<any>) => Promise<User>): Promise<User> {
        let initialState = {};
        let store = mockStore(initialState);

        return loginAction(store.dispatch).then(function (user: User) {
            let numberOfActions = (redirectPath) ? 3 : 2;
            let actions = store.getActions() as any;
            expect(actions.length).to.equal(numberOfActions);
            expect(actions[0].type).to.equal("SENDING_REQUEST");
            expect(actions[0].sending).to.equal(true);
            expect(actions[1].type).to.equal("SENDING_REQUEST");
            expect(actions[1].sending).to.equal(false);

            if (redirectPath) {
                let redirectAction: any = actions[2];
                verifyReplaceAction(redirectAction, redirectPath);
            }
            return user;
        });
    }

    function verifyUnsuccessfullLogin(loginAction: (dispatch: Redux.Dispatch<any>) => Promise<User>): Promise<void> {
        let initialState = {};
        let store = mockStore(initialState);

        return loginAction(store.dispatch)
            .catch(function (err: Error) {
                let actions = store.getActions() as any;
                expect(actions.length).to.equal(3);
                expect(actions[0].type).to.equal("SENDING_REQUEST");
                expect(actions[0].sending).to.equal(true);
                expect(actions[1].type).to.equal("SENDING_REQUEST");
                expect(actions[1].sending).to.equal(false);
                expect(actions[2].type).to.equal("bst/AUTH_FORM_ERROR");
                expect(actions[2].error).to.equal(err.message);
            });
    }

    function verifyReplaceAction(action: any, path: string) {
        if (path) {
            expect(action.payload.method).to.equal("replace"); // This is redux-route method which could change as that library changes.
            expect(action.payload.args[0]).to.equal(path);
        }
    }
});
