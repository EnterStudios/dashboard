import { SetLoading } from "../actions/loading";
import { SET_LOADING } from "../constants";

export type LoadingState = {
    loading: boolean;
};

const INITIAL_STATE: LoadingState = {
    loading: false,
};

type SessionStateAction = SetLoading | { type: "" };

export function loading(state: LoadingState = INITIAL_STATE, action: SessionStateAction): LoadingState {

  switch (action.type) {
    case SET_LOADING:
      return { ...state, ...{ loading: action.loading } };
    default:
      return state;
  }
}
