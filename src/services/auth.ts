import * as ReactGA from "react-ga";

import { FirebaseUser } from "../models/user";
import { User, UserDetails } from "../models/user";
import { BrowserStorage, LocalStorage } from "../store/local-storage";
import browser from "../utils/browser";
import { remoteservice } from "./remote-service";
import { source } from "./source";

/**
 * Auth Service
 */
namespace auth {

    const globalWindow: any = typeof (window) !== "undefined" ? window : {};
    const { heap } = globalWindow;

    export function loginWithGithub(auth?: remoteservice.auth.Auth, storage?: LocalStorage, db: remoteservice.database.Database = remoteservice.defaultService().database()): Promise<User> {
        let provider = new remoteservice.auth.GithubAuthProvider();
        return loginWithProvider(provider, auth, storage, db);
    }

    export async function loginWithAmazon(auth?: remoteservice.auth.Auth, storage?: LocalStorage, window?: any): Promise<User> {
        const options = { scope: "profile", interactive: "always" };
        window = window ? window : globalWindow;
        const accessToken = await amazonAuthorize(options, window);
        const amazonProfile: any = await amazonRetrieveProfile(accessToken, window);
        const authResponse = await source.getAuthToken(amazonProfile.PrimaryEmail, amazonProfile.Name);
        return loginWithCustomToken(authResponse.authToken, auth, storage);
    }

    function amazonAuthorize(options: any, window: any): Promise<string> {
        return new Promise(function (resolve, reject) {
            window.amazon.Login.authorize(options, function (result: any) {
                if (result.error) {
                    reject(result.error);
                    return;
                };
                resolve(result.access_token);
            });
        });
    }

    function amazonRetrieveProfile(accessToken: string, window: any) {
        return new Promise(function (resolve, reject) {
            window.amazon.Login.retrieveProfile(accessToken, function (result: any) {
                if (result.error) {
                    reject(result.error);
                    return;
                };
                resolve(result.profile);
            });
        });
    }

    async function loginWithProvider(provider: remoteservice.auth.AuthProvider, auth: remoteservice.auth.Auth = remoteservice.defaultService().auth(), storage?: LocalStorage, db: remoteservice.database.Database = remoteservice.defaultService().database()): Promise<User> {
        let result: any;
        let ref = db.ref();
        try {
            if (browser.isMobileOrTablet()) {
                result = await auth.signInWithRedirect(provider);
            } else {
                result = await auth.signInWithPopup(provider);
            }
            const data = await ref.child("/users/" + result.user.uid).once("value");
            const validation = data.val() && !data.val().registered;
            if (validation) {
                ref.child("/users/" + result.user.uid).update({ registered: true });
            }
            return authProviderSuccessHandler(result, storage, !validation);
        } catch (err) {
            return authProviderSuccessHandler(err, storage, false);
        }
    }

    function authProviderSuccessHandler(result: any, localStorage: LocalStorage = new BrowserStorage(), isSignUp: boolean): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            let user: User = undefined;
            if (result.user) {
                ReactGA.event({
                    category: "Authorization",
                    action: isSignUp ? "Signup With Github" : "Login With Github"
                });
                if (isSignUp) {
                    globalWindow.google_trackConversion && globalWindow.google_trackConversion({
                        google_conversion_id: 860338926,
                        google_conversion_label: "W121CKKEh3YQ7vWemgM",
                        google_remarketing_only: false,
                    });
                }
                user = new FirebaseUser(result.user);
                identify(user, "github");
                localStorage.setItem("user", JSON.stringify(user));
                resolve(user);
            } else {
                reject(new Error("Error returned trying to log in."));
            }
        });
    }

    function validateEmail(email: string): Promise<any> {
        let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return new Promise<any>(function (resolve, reject) {
            if (re.test(email)) {
                resolve(email);
            } else {
                reject(new Error("Email " + email + " is not a valid email."));
            }
        });
    }

    function validatePassword(password: string, confirmPassword: string): Promise<any> {
        let matchProm = new Promise<any>(function (resolve, reject) {
            if (password === confirmPassword) {
                resolve(password);
            } else {
                reject(new Error("Passwords do not match."));
            }
        });
        let sizeProm = new Promise<any>(function (resolve, reject) {
            if (password.length >= 6) {
                resolve(password);
            } else {
                reject(new Error("Password must be greater than five characters."));
            }
        });

        return Promise.all([matchProm, sizeProm]);
    }

    export function signUpWithEmail(email: string, password: string, confirmPassword: string, auth: remoteservice.auth.Auth = remoteservice.defaultService().auth(), localStorage: LocalStorage = new BrowserStorage()): Promise<User> {
        return Promise.all([validateEmail(email), validatePassword(password, confirmPassword)])
            .then(function (result: any) {
                return auth.createUserWithEmailAndPassword(email, password);
            }).then(function (user: remoteservice.user.User) {
                ReactGA.event({
                    category: "Authorization",
                    action: "Signup With Email"
                });
                globalWindow.google_trackConversion && globalWindow.google_trackConversion({
                    google_conversion_id: 860338926,
                    google_conversion_label: "M7SmCOmKgXYQ7vWemgM",
                    google_remarketing_only: false,
                });
                user.sendEmailVerification();
                let modelUser: User = new FirebaseUser(user);
                identify(modelUser, "email");
                localStorage.setItem("user", JSON.stringify(modelUser));
                return modelUser;
            });
    }

    export function login(email: string, password: string, auth: remoteservice.auth.Auth = remoteservice.defaultService().auth(), localStorage: LocalStorage = new BrowserStorage()): Promise<User> {
        return auth.signInWithEmailAndPassword(email, password)
            .then(function (user: remoteservice.user.User) {
                ReactGA.event({
                    category: "Authorization",
                    action: "Login With Email"
                });
                let modelUser: User = new FirebaseUser(user);
                identify(modelUser, "email");
                localStorage.setItem("user", JSON.stringify(modelUser));
                return modelUser;
            });
    }

    export async function loginWithCustomToken(token: string, auth: remoteservice.auth.Auth = remoteservice.defaultService().auth(), localStorage: LocalStorage = new BrowserStorage()): Promise<User> {
        const user: remoteservice.user.User = await auth.signInWithCustomToken(token);
        ReactGA.event({
            category: "Authorization",
            action: "Login With Custom Token"
        });
        const modelUser: User = new FirebaseUser(user);
        identify(modelUser, "custom token");
        localStorage.setItem("user", JSON.stringify(modelUser));
        return modelUser;
    }

    export function logout(auth: remoteservice.auth.Auth = remoteservice.defaultService().auth(), localStorage: LocalStorage = new BrowserStorage()): Promise<any> {
        return auth.signOut().then(function () {
            localStorage.removeItem("user");
        });
    }

    export function user(localStorage: LocalStorage = new BrowserStorage()): User | undefined {
        return localStorage.getItem("user") ? new User(JSON.parse(localStorage.getItem("user"))) : undefined;
    }

    export function sendResetPasswordEmail(email: string, auth: remoteservice.auth.Auth = remoteservice.defaultService().auth()): Promise<any> {
        return auth.sendPasswordResetEmail(email);
    }

    function identify(user: User, loginType: string) {
        if (typeof (heap) !== "undefined") heap.identify(user.userId);
        if (typeof (heap) !== "undefined") heap.addUserProperties({ "Email": user.email, "Name": user.displayName, "LoginType": loginType });
    }

    export function updateCurrentUser(props: Object): Promise<any> {
        const currentUser = remoteservice.defaultService().auth().currentUser;
        return remoteservice.defaultService().database().ref()
            .child("/users/" + currentUser.uid).update(props);
    }

    export function currentUserDetails(): Promise<UserDetails> {
        const currentUser = remoteservice.defaultService().auth().currentUser;
        return remoteservice.defaultService().database().ref().child("/users/" + currentUser.uid).once("value")
            .then((retVal) => {
                const data = retVal.val();
                return new UserDetails(data.silentEchoToken, data.smAPIAccessToken, data.vendorID);
            });
    }
}

export default auth;
