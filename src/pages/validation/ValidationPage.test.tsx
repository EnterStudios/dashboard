import * as chai from "chai";
import {mount, shallow} from "enzyme";
import * as React from "react";
import Input from "react-toolbox/lib/input";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

let jsdom = require("mocha-jsdom");

import {ValidationParentComponent} from "../../components/Validation/ValidationParentComponent";
import Source from "../../models/source";
import { User } from "../../models/user";
import auth from "../../services/auth";
import SourceService from "../../services/source";
import { Location } from "../../utils/Location";
import { ValidationPage } from "./ValidationPage";

chai.use(sinonChai);
let expect = chai.expect;

describe("Validation Page", function () {
    jsdom();
    let user = new User({ email: "my@email.com" });
    let source = new Source({ id: "001-abc", name: "awesome source" });
    let location: Location = {basename: "", pathname: "", query: {}};

    describe("Existing validation token", function() {
        let currentUserDetailsStub: sinon.SinonStub;
        let userDetailsPromise: Promise<any>;
        let userDetails: any;

        beforeEach(function() {
            userDetails = {silentEchoToken: "silentEchoToken"};
            userDetailsPromise = Promise.resolve(userDetails);
            currentUserDetailsStub = sinon.stub(auth, "currentUserDetails").returns(userDetailsPromise);
        });
        afterEach(function() {
            currentUserDetailsStub.restore();
        });
        it("Tests that validation token is set.", function () {
            const wrapper = mount(<ValidationPage user={user} source={source} location={location} sources={undefined} getSources={undefined} setSource={undefined} goTo={undefined} setLoading={undefined} />);
            const parentComponentWrapper = wrapper.find(ValidationParentComponent);
            return userDetailsPromise.then(() => {
                expect(parentComponentWrapper.find(Input)
                    .at(2).prop("value"))
                    .to.equal(userDetails.silentEchoToken);
            });
        });
    });
    describe("Validation results", function() {
        let updateCurrentUserPromise: Promise<any>;
        let updateCurrentUserStub: sinon.SinonStub;
        let validateSourcePromise: Promise<any>;
        let validateSourceStub: sinon.SinonStub;

        beforeEach(function() {
            updateCurrentUserPromise = Promise.resolve();
            updateCurrentUserStub = sinon.stub(auth, "updateCurrentUser").returns(updateCurrentUserPromise);
            validateSourcePromise = Promise.resolve("results");
            validateSourceStub = sinon.stub(SourceService, "validateSource").returns(validateSourcePromise);
        });
        afterEach(function() {
            updateCurrentUserStub.restore();
            validateSourceStub.restore();
        });
        // TODO: unskip once we migrate to new parent and child component (new test file)
        it.skip("Tests that validation results are shown.", function() {
            const wrapper = shallow(<ValidationPage user={user} source={source} location={location} sources={undefined} getSources={undefined} setSource={undefined} goTo={undefined} setLoading={undefined} />);
            wrapper.setState({
                token: "token",
                script: "script",
                tokenChanged: "false",
            });
            wrapper.find("form").first().simulate("submit", {preventDefault() {} });
            return updateCurrentUserPromise.then(() => {
                return validateSourcePromise.then(() => {
                    expect(wrapper.state("dialogActive")).to.be.true;
                    expect(wrapper.state("validationResults")).to.equal("results");
                });
            });
        });
    });

});
