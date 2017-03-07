import * as chai from "chai";
import { shallow, ShallowWrapper } from "enzyme";
import * as React from "react";

import Conversation, { createConvo } from "../../../models/conversation";
import { alexaRequestIntentLog, alexaResponseLog } from "../../../utils/test";
import ConvoIcon from "./ConvoIcon";
import ConvoMainContent from "./ConvoMainContent";
import TimeTextComponent from "./ConvoTimeTextComponent";

const expect = chai.expect;

const primaryStyle = {
    width: "100px",
    height: "200px"
};

const subtitleStyle = {
    width: "200px",
    height: "300px"

};

const iconStyle = {
    width: "300px",
    height: "400px"
};

describe("ConvoMainContent", function () {
    let conversation: Conversation;

    before(function () {
        conversation = createConvo({ request: alexaRequestIntentLog(), response: alexaResponseLog() });
    });

    describe("Render", function () {
        let wrapper: ShallowWrapper<any, any>;

        describe("Defaults", function () {
            before(function () {
                wrapper = shallow(<ConvoMainContent
                    conversation={conversation}
                />);
            });

            it("Tests the default style for primary component", function () {
                expect(wrapper.find("span").at(0).prop("style")).to.deep.equal(ConvoMainContent.primaryContentStyle);
            });

            it("Tests the default style for icon", function () {
                expect(wrapper.find(ConvoIcon).at(0).prop("style")).to.deep.equal(ConvoMainContent.iconStyle);
            });

            it("Tests the default style for subtitle", function () {
                expect(wrapper.find(TimeTextComponent).at(0).prop("style")).to.deep.equal(ConvoMainContent.subtitleStyle);
            });

            describe("Icon", function () {
                it("Tests it contains the icon is displayed.", function () {
                    expect(wrapper.find(ConvoIcon)).to.have.length(1);
                });

                it("Tests the props are passed down.", function () {
                    const iconWrapper = wrapper.find(ConvoIcon).at(0);

                    expect(iconWrapper).to.have.prop("origin", conversation.origin);
                    expect(iconWrapper).to.have.prop("color", conversation.userColors.fill);
                });
            });

            describe("Intent text", function () {
                it("Tests that the conversation text is displayed.", function () {
                    const intentWrapper = wrapper.find("span").at(1);

                    expect(intentWrapper).to.have.text(conversation.requestPayloadType);
                });
            });

            describe("TimeTextComponent", function () {
                it("Tests that the TimeTextComponent is displayed.", function () {
                    expect(wrapper.find(TimeTextComponent)).to.have.length(1);
                });

                it("Tests that the TiemTextComponent has good props.", function () {
                    const timeWrapper = wrapper.find(TimeTextComponent).at(0);

                    expect(timeWrapper).has.prop("timestamp", conversation.timestamp);
                });
            });
        });

        describe("Styles", function () {
            before(function () {
                wrapper = shallow(
                    <ConvoMainContent
                        conversation={conversation}
                        iconStyle={iconStyle}
                        subtitleStyle={subtitleStyle}
                        primaryContentStyle={primaryStyle} />
                );
            });

            it("Tests the primary style was applied.", function () {
                const combindStyle = { ...ConvoMainContent.primaryContentStyle, ...primaryStyle };
                let primaryWrapper = wrapper.find("span").at(0);
                expect(primaryWrapper.prop("style")).to.deep.equal(combindStyle);
            });

            it("Tests the subtitle style was applied.", function () {
                const combindStyle = { ...ConvoMainContent.subtitleStyle, ...subtitleStyle };
                let subtitleWrapper = wrapper.find(TimeTextComponent).at(0);
                expect(subtitleWrapper.prop("style")).to.deep.equal(combindStyle);
            });

            it("Tests the icon style was applied.", function () {
                const combindStyle = { ...ConvoMainContent.iconStyle, ...iconStyle };
                let iconWrapper = wrapper.find(ConvoIcon).at(0);
                expect(iconWrapper.prop("style")).to.deep.equal(combindStyle);
            });
        });
    });
});