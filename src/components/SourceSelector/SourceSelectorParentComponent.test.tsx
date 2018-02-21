import * as chai from "chai";
import {shallow} from "enzyme";
import * as React from "react";
import * as sinon from "sinon";

import { Source } from "../../models/source";
import auth from "../../services/auth";
import { dummySources } from "../../utils/test";
import SourceSelectorCreate from "./SourceSelectorCreateComponent";
import SourceSelectorItem from "./SourceSelectorItemComponent";
import { SourceSelector } from "./SourceSelectorParentComponent";

const expect = chai.expect;

describe("Source Selector Component", function () {

    let sources: Source[];

    before(function () {
        sources = dummySources(4);
    });

    describe("source Selector Parent Component", function () {

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

        it("should render correctly", function () {
            const wrapper = shallow(<SourceSelector source={undefined} sources={sources} goTo={undefined} getSources={undefined} setSource={undefined} removeSource={undefined} />);

            const createButton = wrapper.find(SourceSelectorCreate);
            const items = wrapper.find(SourceSelectorItem);
            expect(createButton).to.have.length(1);
            expect(items).to.have.length(4);
        });
    });
});
