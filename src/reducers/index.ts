import { routerReducer } from "react-router-redux";
import { combineReducers } from "redux";

import { LOGOUT_USER } from "../constants";
import { authForm, AuthFormState } from "./auth-form";
import { loading, LoadingState } from "./loading";
import { log, LogState } from "./log";
import { notification, NotificationState } from "./notification";
import { session, SessionState } from "./session";
import { source, SourceState } from "./source";
import {toasts, ToastState} from "./toast";

export namespace State {
  export type All = {
    authForm: AuthFormState,
    log: LogState,
    notification: NotificationState,
    routing: any,
    session: SessionState,
    source: SourceState;
    toasts: ToastState;
    loading?: LoadingState;
  };
}

const appReducer = combineReducers<State.All>({
  authForm,
  log,
  notification,
  routing: routerReducer,
  session,
  source,
  toasts,
  loading,
});

// Intercept global actions, such as logout to reset the state.
// From http://stackoverflow.com/a/35641992/1349766
const rootReducer = function(state: State.All, action: Redux.Action) {

  if (action.type === LOGOUT_USER) {
    state = undefined;
  }

  // and pass it on to the high level reducers
  return appReducer(state, action);
};

export default rootReducer;
