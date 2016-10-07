/*
 * AppConstants
 * These are the variables that determine what our central data store (reducer.js)
 * changes in our state. When you add a new action, you have to add a new constant here
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = "YOUR_ACTION_CONSTANT";
 */
export const CHANGE_FORM = "CHANGE_FORM";
export const SET_AUTH = "SET_AUTH";
export const SENDING_REQUEST = "SENDING_REQUEST";

export const LOGIN_USER_PENDING = "App/LOGIN_USER_PENDING";
export const LOGIN_USER_SUCCESS = "App/LOGIN_USER_SUCCESS";
export const LOGIN_USER_ERROR = "App/LOGIN_USER_ERROR";
export const LOGOUT_USER = "App/LOGOUT_USER";