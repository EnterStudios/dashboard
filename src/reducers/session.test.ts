import { expect } from "chai";

import { setAmazonFlow, setUser } from "../actions/session";
import User  from "../models/user";
import { session } from "./session";

describe("Session Reducer", function () {
    it("returns the initial state", function () {
        const newState = session(undefined, { type: "" });
        expect(newState.hasError).to.be.false;
        expect(newState.isLoading).to.be.false;
        expect(newState.user).to.be.undefined;
    });
    describe("SetUser Action", function() {
        it("sets the user", function() {
            const newUser = new User({email: "email"});
            const setUserAction = setUser(newUser);
            const newState = session(undefined, setUserAction);
            expect(newState.user).to.equal(newUser);
        });
    });
    describe("SetAmazonFlow Action", function() {
        it("sets the amazon flow flag", function() {
            const setAmazonFlowAction = setAmazonFlow(true);
            const newState = session(undefined, setAmazonFlowAction);
            expect(newState.amazonFlow).to.equal(true);
        });
    });
});
