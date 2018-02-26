import * as chai from "chai";
import { shallow } from "enzyme";
import * as React from "react";
import * as sinonChai from "sinon-chai";
import RightPanel from "../components/RightPanel";

import WelcomePage from "./WelcomePage";

// Setup chai with sinon-chai
chai.use(sinonChai);
let expect = chai.expect;

describe("HomePage", function () {
    it("should render correctly", function () {
        const wrapper = shallow(
            <WelcomePage/>
        );

        expect(wrapper.find(RightPanel)).to.have.length(1);
    });
});
