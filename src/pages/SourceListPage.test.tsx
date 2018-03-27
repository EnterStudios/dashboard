import * as chai from "chai";
import {shallow} from "enzyme";
import * as React from "react";
import * as sinon from "sinon";

import { Source } from "../models/source";
import auth from "../services/auth";
import { dummySources } from "../utils/test";
import { SourceListPage } from "./SourceListPage";
import WelcomePage from "./WelcomePage";

import SourceSelector from "../components/SourceSelector/SourceSelectorParentComponent";

let expect = chai.expect;

describe("Source List Page", function () {

    let sources: Source[];

    before(function () {
        sources = dummySources(4);
    });

    describe("Full render", function () {

        let currentUserDetailsStub: sinon.SinonStub;
        let userDetailsPromise: Promise<any>;
        let userDetails: any;

        beforeEach(function () {
            userDetails = { silentEchoToken: "silentEchoToken" };
            userDetailsPromise = Promise.resolve(userDetails);
            currentUserDetailsStub = sinon.stub(auth, "currentUserDetails").returns(userDetailsPromise);
        });

        afterEach(function () {
            currentUserDetailsStub.restore();
        });

        it("should render correctly without the amazon flow", function () {
            const wrapper = shallow(<SourceListPage source={undefined} sources={sources} finishLoading={true} amazonFlow={false} user={undefined} setAmazonFlow={undefined} goTo={undefined} getSources={undefined} setLoading={undefined} />);

            const twoPaneWrapper = wrapper.find("TwoPane");
            const leftSide = twoPaneWrapper.find(SourceSelector);
            const rightSide = twoPaneWrapper.find(WelcomePage);
            const amazonPaneWrapper = wrapper.find("AmazonVendorPane");
            expect(leftSide).to.have.length(1);
            expect(amazonPaneWrapper).to.have.length(0);
            expect(rightSide).to.have.length(1);
        });

        it("should render correctly with the amazon flow", function () {

            const wrapper = shallow(<SourceListPage source={undefined} sources={sources} finishLoading={true} amazonFlow={true} user={undefined} setAmazonFlow={undefined} goTo={undefined} getSources={undefined} setLoading={undefined} />);
            const twoPaneWrapper = wrapper.find("TwoPane");
            const amazonPaneWrapper = wrapper.find("AmazonVendorPane");
            expect(twoPaneWrapper).to.have.length(1);
            expect(amazonPaneWrapper).to.have.length(0);
        });
    });
});
