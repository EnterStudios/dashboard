import * as chai from "chai";
import {shallow} from "enzyme";
import * as React from "react";
import {IconButton} from "react-toolbox";

import { Source } from "../../models/source";
import { dummySources } from "../../utils/test";
import SourceSelectorCreate from "./SourceSelectorCreateComponent";

const expect = chai.expect;

describe("Source Selector", function () {

    let sources: Source[];

    before(function () {
        sources = dummySources(1);
    });

    describe("Create Component", function () {

        it("should render correctly", function () {
            const wrapper = shallow(<SourceSelectorCreate setSource={undefined} defaultSourceNumber={"0"} handleLoadingChange={undefined} goTo={undefined} getSources={undefined} />);
            expect(wrapper.find("div")).to.have.length(2);
            expect(wrapper.find(IconButton)).to.have.length(1);
        });
    });
});
