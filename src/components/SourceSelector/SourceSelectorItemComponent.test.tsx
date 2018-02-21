import * as chai from "chai";
import {shallow} from "enzyme";
import * as React from "react";
import {IconButton} from "react-toolbox";
import Dialog from "react-toolbox/lib/dialog";

import { Source } from "../../models/source";
import { dummySources } from "../../utils/test";
import SourceSelectorItem from "./SourceSelectorItemComponent";

const expect = chai.expect;

describe("Source Selector", function () {

    let sources: Source[];

    before(function () {
        sources = dummySources(1);
    });

    describe("Item Component", function () {

        it("should render correctly with no validation data", function () {
            const wrapper = shallow(<SourceSelectorItem active={false} source={sources[0]} removeSource={undefined} onClick={undefined} handleLoadingChange={undefined} sourceType={"ALEXA SKILL"} goTo={undefined} getSources={undefined} />);
            expect(wrapper.find("div")).to.have.length(7);
            expect(wrapper.find("img")).to.have.length(1);
            expect(wrapper.find(IconButton)).to.have.length(2);
            expect(wrapper.find(Dialog)).to.have.length(1);
        });
    });
});
