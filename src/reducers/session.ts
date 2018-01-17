import { AmazonFlowFlag, SetUser } from "../actions/session";
import { SET_AMAZON_FLOW, SET_USER } from "../constants";
import User from "../models/user";

export type SessionState = {
  readonly user?: User,
  readonly hasError: boolean,
  readonly isLoading: boolean,
  readonly amazonFlow: boolean
};

const INITIAL_STATE: SessionState = {
  hasError: false,
  isLoading: false,
  amazonFlow: false
};

type SessionStateAction = AmazonFlowFlag | SetUser | { type: "" };

export function session(state: SessionState = INITIAL_STATE, action: SessionStateAction): SessionState {

  switch (action.type) {
    case SET_USER:
      return { ...state, ...{ user: action.user } };
    case SET_AMAZON_FLOW:
      return { ...state, ...{ amazonFlow: action.amazonFlow } };
    default:
      return state;
  }
}
