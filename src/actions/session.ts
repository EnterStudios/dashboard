import { authFormError } from "../actions/auth-form";
import { displaySnackbar } from "../actions/notification";
import { SENDING_REQUEST, SET_AMAZON_FLOW, SET_USER } from "../constants";
import User from "../models/user";
import auth from "../services/auth";

export function sendingRequest(sending: boolean) {
  return {
    type: SENDING_REQUEST,
    sending: sending
  };
}

export type SetUser = {
  type: SET_USER,
  user: User | undefined
};

export type AmazonFlowFlag = {
  type: SET_AMAZON_FLOW,
  amazonFlow: boolean
};

export function setUser(user: User | undefined): SetUser {
  return {
    type: SET_USER,
    user: user
  };
}

export function setAmazonFlow(amazonFlow: boolean): AmazonFlowFlag {
  return {
    type: SET_AMAZON_FLOW,
    amazonFlow: amazonFlow
  };
}

export interface SuccessCallback {
  loginSuccess(dispatch: Redux.Dispatch<any>, user: User): void;
}

function loginMethod(dispatch: Redux.Dispatch<any>, loginStrat: () => Promise<User>, redirectStrat?: SuccessCallback): Promise<User> {
  dispatch(sendingRequest(true));
  return loginStrat()
    .then(function (user: User) {
      dispatch(sendingRequest(false));

      if (redirectStrat) {
        redirectStrat.loginSuccess(dispatch, auth.user());
      }

      return user;
    }).catch(function (err: Error) {
      dispatch(sendingRequest(false));
      dispatch(authFormError(err.message));
      throw err;
    });
}

export function login(email: string, password: string, redirectStrat?: SuccessCallback): (dispatch: Redux.Dispatch<any>) => Promise<User> {
  return function (dispatch: Redux.Dispatch<any>): Promise<User> {
    return loginMethod(dispatch, function () {
      return auth.login(email, password);
    }, redirectStrat);
  };
}

export function loginWithGithub(redirectStrat?: SuccessCallback): (dispatch: Redux.Dispatch<any>) => Promise<User> {
  return function (dispatch: Redux.Dispatch<any>) {
    return loginMethod(dispatch, function () {
      return auth.loginWithGithub();
    }, redirectStrat);
  };
}

export function loginWithAmazon(redirectStrat?: SuccessCallback): (dispatch: Redux.Dispatch<any>) => Promise<User> {
  return function (dispatch: Redux.Dispatch<any>) {
    return loginMethod(dispatch, function () {
      return auth.loginWithAmazon();
    }, redirectStrat);
  };
}

export function signUpWithEmail(email: string, password: string, confirmPassword: string, redirectStrat?: SuccessCallback): (dispatch: Redux.Dispatch<any>) => Promise<User> {
  return function (dispatch: Redux.Dispatch<any>) {
    return loginMethod(dispatch, function () {
      return auth.signUpWithEmail(email, password, confirmPassword);
    }, redirectStrat);
  };
}

export function logout(callback?: (success: boolean) => void): (dispatch: Redux.Dispatch<any>) => Promise<void> {
  return function (dispatch: Redux.Dispatch<void>) {
    return auth.logout().then(function () {
      if (callback) {
        callback(true);
      }
    }).catch(function (err: Error) {
      if (callback) {
        callback(false);
      }
    });
  };
}

export function resetPassword(email: string, callback?: (success: boolean) => void): (dispatch: Redux.Dispatch<any>) => Promise<void> {
  return function (dispatch: Redux.Dispatch<void>) {
    return auth.sendResetPasswordEmail(email).then(function () {
      dispatch(displaySnackbar("Check your inbox!"));
      if (callback) {
        callback(true);
      }
    }).catch(function (error: Error) {
      dispatch(authFormError(error.message));
      if (callback) {
        callback(false);
      }
    });
  };
}