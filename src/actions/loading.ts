import { SET_LOADING } from "../constants";

export type SetLoading = {
  type: SET_LOADING,
  loading: boolean,
};

export function setLoading(value: boolean): SetLoading {
  return {
    type: SET_LOADING,
    loading: value,
  };
}
