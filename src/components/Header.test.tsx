import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { shallow, ShallowWrapper } from "enzyme";
import * as React from "react";
import { Button } from "react-toolbox/lib/button";
import {Tab} from "react-toolbox/lib/tabs";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import ButtonMenu from "../components/ButtonMenu";

import { Header, HeaderButton, HeaderProps, HeaderState, Home, PageButton, PageSwap } from "./Header";
import { Title } from "./Title";

const Autosuggest: any = require("react-autosuggest");
// Setup chai with sinon-chai
chai.use(sinonChai);
let expect = chai.expect;

describe("Header", function () {
    describe("without any properties", function () {

        const wrapper = shallow(<Header />);

        it("renders the main header div", function () {
            expect(wrapper.find("header")).to.have.length(1);
        });

        it("Renders the home Link", function () {
            expect(wrapper.find(Home)).to.have.length(1);
        });

        it("Renders the page swapper", function () {
            expect(wrapper.find(PageSwap)).to.have.length(1);
        });

        it("renders the menu", function () {
            expect(wrapper.find(ButtonMenu)).to.have.length(1);
        });
    });

    describe("Header Button", function() {
        let headerButton: ShallowWrapper<any, any>;
        let button: PageButton;
        let onClick: sinon.SinonStub;

        before(function() {
            button = { name: "TestButton", icon: "Test Icon", tooltip: "Test Tooltip"};
            onClick = sinon.stub();
            headerButton = shallow(<HeaderButton
                button={button}
                onClick={onClick}
                 />);
        });

        afterEach(function() {
            onClick.reset();
        });

        it("Tests that the props are passed to the underlying button.", function() {
            const themedButton = headerButton.find("Themed");
            expect(themedButton).to.have.length(1);
            expect(themedButton).to.have.prop("tooltip", button.tooltip);
            expect(themedButton).to.have.prop("icon", button.icon);
        });

        it("Tests that the click works.", function() {
            const themedButton = headerButton.find("Themed");
            themedButton.simulate("click");

            expect(onClick).to.be.calledWith(button);
        });
    });

    describe("DisplayHome property", function () {

        it("displays a Link to home", function () {
            const wrapper = shallow(<Header displayHomeButton={true} />);
            const homeWrapper = wrapper.find(Home);
            expect(homeWrapper).to.have.length(1);
            expect(homeWrapper.prop("showHome")).to.be.true;
        });

        describe("Home button", function () {

            let handleHomeClick: sinon.SinonStub;

            before(function () {
                handleHomeClick = sinon.stub();
            });

            beforeEach(function () {
                handleHomeClick.reset();
            });

            it("Displays the button when props say true.", function () {
                const wrapper = shallow(<Home handleHomeClick={handleHomeClick} showHome={true} />);
                expect(wrapper.find(Button)).to.have.length(1);
            });

            it("Displays the button when props say true.", function () {
                const wrapper = shallow(<Home handleHomeClick={handleHomeClick} showHome={false} />);
                expect(wrapper.find(Button)).to.have.length(0);
            });

            it("Calls the callback when clicked.", function () {
                const wrapper = shallow(<Home handleHomeClick={handleHomeClick} showHome={true} />);
                const iconButton = wrapper.find(Button).at(0);
                iconButton.simulate("click");
                expect(handleHomeClick).to.have.been.calledOnce;
            });
        });
    });

    describe("with one source", function () {
        const sources = [{ label: "name", value: "id", source: {id: "id"} }];
        const wrapper = shallow(<Header isValidationPage={false} sources={[{ label: "name", value: "id", source: {id: "id"} }]} />);
        // TODO: unskip once we migrate to new title component (new test file)
        it.skip("renders the title", function () {
            const titleWrapper = wrapper.find(Title);
            expect(titleWrapper).to.have.length(1);
            expect(titleWrapper.prop("sources")).to.deep.equal(sources);
        });

        describe("Title", function () {

            let handleItemSelect: sinon.SinonStub;

            before(function () {
                handleItemSelect = sinon.stub();
            });

            beforeEach(function () {
                handleItemSelect.reset();
            });

            it("Renders the span with only one source.", function () {
                const wrapper = shallow(<Title handleItemSelect={handleItemSelect} selectedSourceId={""} sources={sources} />);
                expect(wrapper.find("span")).to.have.length(1);
                expect(wrapper.find("span").text()).to.have.equal("name");
            });
        });
    });

    describe("with multiple sources", function () {
        let wrapper: ShallowWrapper<HeaderProps, HeaderState>;
        const componentWillReceivePropsSpy = sinon.spy(Header.prototype, "componentWillReceiveProps");
        const setStateSpy = sinon.spy(Header.prototype, "setState");
        const onSourceSelectedSpy = sinon.spy();
        const sources = [{ label: "name", value: "id", source: {id: "id"} }, { label: "name1", value: "id1", source: {id: "id1"} }, { label: "name2", value: "id2", source: {id: "id2"} }, { label: "name3", value: "id3", source: {id: "id3"} }];

        beforeEach(function () {
            wrapper = shallow((
                <Header
                    onSourceSelected={onSourceSelectedSpy}
                    sources={sources}
                />
            ));
        });

        afterEach(function () {
            componentWillReceivePropsSpy.reset();
            setStateSpy.reset();
        });
        // TODO: unskip once we migrate to new title component (new test file)
        it.skip("renders the title", function () {
            const titleWrapper = wrapper.find(Title);
            expect(titleWrapper).to.have.length(1);
            expect(titleWrapper.prop("sources")).to.equal(sources);
        });
        // TODO: unskip once we migrate to new title component (new test file)
        it.skip("updates the selectedSourceId on receiving props", function () {
            wrapper.setProps({ currentSourceId: "id" });
            expect(componentWillReceivePropsSpy).to.have.been.calledOnce;
            expect(wrapper.state().selectedSourceId).to.equal("id");
            expect(setStateSpy).to.have.been.calledOnce;
            expect(setStateSpy).to.have.been.calledWith({ selectedSourceId: "id", amazonFlow: false });

            const titleWrapper = wrapper.find(Title);
            expect(titleWrapper.prop("selectedSourceId")).to.equal("id");
        });

        it("calls the onSourceSelected prop", function () {
            // need to go untyped here so we can call the method on the component
            let instance = wrapper.instance() as any;
            instance.handleItemSelect("id");

            expect(onSourceSelectedSpy).to.have.been.calledOnce;
            expect(onSourceSelectedSpy).to.have.been.calledWith({ label: "name", value: "id", source: {id: "id"} });
        });

        describe("Title", function () {

            let handleItemSelect: sinon.SinonStub;
            let wrapper: ShallowWrapper<any, any>;

            before(function () {
                handleItemSelect = sinon.stub();
                wrapper = shallow((
                    <Title
                        sources={sources}
                        handleItemSelect={handleItemSelect}
                        selectedSourceId={"id"} />
                ));
            });

            beforeEach(function () {
                handleItemSelect.reset();
            });

            it("Tests the title renders the Dropdown.", function () {
                wrapper.setProps({ sources: sources });
                const dropdownWrapper = wrapper.find(Autosuggest);
                expect(dropdownWrapper).to.have.length(1);
                expect(dropdownWrapper.prop("suggestions")).to.deep.equal(sources);
                expect(dropdownWrapper.prop("inputProps").placeholder).to.equal("name");
            });
        });
    });

    describe("Page swapper", function () {
        const pages: PageButton[] = [
            { icon: "home", name: "heeyyooo", tooltip: "home tooltip" },
            { icon: "away", name: "fancy", tooltip: "away toolip" }
        ];

        let onPageSelected: sinon.SinonStub;

        before(function () {
            onPageSelected = sinon.stub();
            chai.should();
            chai.use(chaiAsPromised);
        });

        beforeEach(function () {
            onPageSelected.reset();
        });

        it("Tests the header passes the appropriate props to the page swap", function () {
            const wrapper = shallow(<Header pageButtons={pages} onPageSelected={onPageSelected} />);
            const pageswap = wrapper.find(PageSwap);
            expect(pageswap.prop("pageButtons")).to.deep.equal(pages);
            expect(pageswap.prop("onPageSelected")).to.equal(onPageSelected);
        });

        describe("PageSwap", function () {
            this.timeout(10000);
            let wrapper: ShallowWrapper<any, any>;
            const newPages: PageButton[] = [
                { icon: "newHome", name: "newName", tooltip: "newHome tooltip" },
                { icon: "newHome2", name: "newName2", tooltip: "newHome2 tooltip" },
                { icon: "newHome3", name: "newName3", tooltip: "newHome3 tooltip" },
                { icon: "newHome3", name: "newName3", tooltip: "newHome3 tooltip"}
            ];

            beforeEach(function(done) {
                wrapper = shallow(<PageSwap pageButtons={pages} onPageSelected={onPageSelected} />);
                setTimeout(() => {
                    done();
                }, 1000);
            });

            it("Tests the tabs are rendered properly.", function(done) {
                wrapper.setProps({ pageButtons: pages });
                expect(Promise.resolve(wrapper.find(Tab))).to.eventually.have.length(pages.length);
                done();
            });

            it ("Tests the callback", async function() {
                wrapper.setProps({ pageButtons: pages });
                const buttons = await Promise.resolve(wrapper.find(Tab).at(0));
                buttons.simulate("active", pages[0]);
                expect(onPageSelected).to.have.been.calledOnce;
                expect(onPageSelected).to.have.been.calledWith(pages[0]);
            });

            it("Tests that it will build new buttons on props change.", async function() {
                wrapper.setProps({ pageButtons: newPages });
                await setTimeout(async () => {
                    const tabs = await Promise.resolve(wrapper.find(Tab));
                    expect(tabs).to.have.length(newPages.length);
                }, 2000);
            });
        });
    });
});
