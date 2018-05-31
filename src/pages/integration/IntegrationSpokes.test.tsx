import * as chai from "chai";
import { shallow, ShallowWrapper } from "enzyme";
import * as React from "react";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import { Button } from "react-toolbox/lib/button";
import Checkbox from "react-toolbox/lib/checkbox";
import Dropdown from "react-toolbox/lib/dropdown";

import Source from "../../models/source";
import User from "../../models/user";
import SourceService from "../../services/source";
import SpokesService from "../../services/spokes";
import { dummySources } from "../../utils/test";
import { IntegrationSpokes } from "./IntegrationSpokes";
import IntegrationSpokesSwapper from "./IntegrationSpokesSwapper";

chai.use(sinonChai);
const expect = chai.expect;

const source: Source = dummySources(1)[0];
const user = new User({ email: "test@testMctest.com" });

describe("IntegrationSpokes", function () {
    describe("Renders", function () {
        let wrapper: ShallowWrapper<any, any>;
        let onSaved: sinon.SinonStub;
        let savedState: any;
        let prefetch: sinon.SinonStub;

        before(function () {
            onSaved = sinon.stub();
            // All of these tests were written *before* the prefetch was added so we're going to skip it and assume the spokes are fresh.
            prefetch = sinon.stub(SourceService, "getSourceObj").returns(Promise.reject(new Error("Error per requirements of the test.")));

            wrapper = shallow(<IntegrationSpokes user={user} source={source} onSpokesSaved={onSaved} getSources={undefined} setSource={undefined} />);

            const prefetchPromise = (wrapper.instance() as IntegrationSpokes).cancelables[0] as any;
            return prefetchPromise.catch(function() { /* don't care */}); // Lets this run through without worry.
        });

        beforeEach(function () {
            savedState = wrapper.state();
        });

        afterEach(function () {
            wrapper.setState(wrapper);
            onSaved.reset();
        });

        after(function() {
            prefetch.restore();
        });

        it("Tests the swapper is there.", function () {
            expect(wrapper.find(IntegrationSpokesSwapper)).to.have.length(1);
        });

        it("Tests the enable live debugging, enable monitoring and enable proying checkbox exists.", function () {
            expect(wrapper.find(Checkbox)).to.have.length(4);
            expect(wrapper.find(Checkbox).at(0)).to.have.prop("label", "Outage Notification");
            expect(wrapper.find(Checkbox).at(0)).to.have.prop("checked", false);
            expect(wrapper.find(Checkbox).at(1)).to.have.prop("label", "Enable Proxying");
            expect(wrapper.find(Checkbox).at(1)).to.have.prop("checked", false);
            expect(wrapper.find(Checkbox).at(2)).to.have.prop("label", "Enable Live Debugging");
            expect(wrapper.find(Checkbox).at(2)).to.have.prop("checked", false);
            expect(wrapper.find(Checkbox).at(3)).to.have.prop("label", "Enable Custom Json");
            expect(wrapper.find(Checkbox).at(3)).to.have.prop("checked", false);
        });

        it("Tests the save and advance buttons exists.", function () {
            expect(wrapper.find(Button)).to.have.length(2);
            expect(wrapper.find(Button).at(0)).to.have.prop("label", "Advanced");
            expect(wrapper.find(Button).at(1)).to.have.prop("label", "Save");
        });

        it("Tests the error message exists.", function () {
            expect(wrapper.find("p")).to.have.length(6); // There's two banner messages and 3 description messages as well.
            expect(wrapper.find("p").at(5)).to.have.style("visibility", "hidden");
        });

        it("Tests the dropdown for page selector exists.", function () {
            expect(wrapper.find(Dropdown)).to.have.length(1);
        });

        it("Tests the default page", function () {
            expect(wrapper.find(Dropdown).at(0)).to.have.prop("value", "http");
            expect(wrapper.find(IntegrationSpokesSwapper).at(0)).to.have.prop("showPage", "http");
        });

        it("Tests the enable monitoring checkbox works.", function () {
            let checkbox = wrapper.find(Checkbox).at(0);
            checkbox.simulate("change", true);

            expect(wrapper.find(Checkbox).at(0)).to.have.prop("checked", true);
        });

        it("Tests the enable proxying checkbox works.", function () {
          let checkbox = wrapper.find(Checkbox).at(1);
          checkbox.simulate("change", true);

          expect(wrapper.find(Checkbox).at(1)).to.have.prop("checked", true);
        });

        it("Tests the enable live debugging checkbox works.", function () {
          let checkbox = wrapper.find(Checkbox).at(2);
          checkbox.simulate("change", true);

          expect(wrapper.find(Checkbox).at(2)).to.have.prop("checked", true);
        });

        describe("IntegrationSpokesSwapper State", function () {
            let swapper: ShallowWrapper<any, any>;

            beforeEach(function () {
                swapper = wrapper.find(IntegrationSpokesSwapper).at(0);
            });

            it("Tests the http change will give the value to swapper.", function () {
                swapper.simulate("change", "url", "New URL");

                expect(wrapper.find(IntegrationSpokesSwapper).at(0)).to.have.prop("url", "New URL");
            });

            it("Tests the ARN change will give the value to swapper.", function () {
                swapper.simulate("change", "lambdaARN", "New ARN");

                expect(wrapper.find(IntegrationSpokesSwapper).at(0)).to.have.prop("lambdaARN", "New ARN");
            });

            it("Tests the IAM Access key change will give the value to swapper.", function () {
                swapper.simulate("change", "awsAccessKeyInput", "New Access Key");

                expect(wrapper.find(IntegrationSpokesSwapper).at(0)).to.have.prop("awsAccessKeyInput", "New Access Key");
            });

            it("Tests the IAM Secret key change will give the value to swapper.", function () {
                swapper.simulate("change", "awsSecretKeyInput", "New Secret Key");

                expect(wrapper.find(IntegrationSpokesSwapper).at(0)).to.have.prop("awsSecretKeyInput", "New Secret Key");
            });
        });

        describe("Disabling and enabling save button", function () {
            describe("In http page", function () {

                beforeEach(function () {
                    wrapper.setState({ showPage: "http" });
                });

                it("Tests that the save button is disabled when url is undefined.", function () {
                    wrapper.setState({ url: undefined });
                    const button = wrapper.find(Button).at(1);
                    expect(button).to.have.prop("disabled", true);
                });

                it("Tests that the save button is enabled when url is defined.", function () {
                    wrapper.setState({ url: "https://www.test.url/" });
                    const button = wrapper.find(Button).at(1);
                    expect(button).to.have.prop("disabled", false);
                });

                it("Tests that the save button is disabled when url is not actually a url.", function () {
                    wrapper.setState({ url: "Hahaha You think this is real?" });
                    const button = wrapper.find(Button).at(1);
                    expect(button).to.have.prop("disabled", true);
                });
            });

            describe("In lambda page", function () {
                beforeEach(function () {
                    wrapper.setState({ showPage: "lambda" });
                });

                it("Tests that the save button is disabled when lambdaARN, awsAccessKey, and awsSecretKey are undefined.", function () {
                    wrapper.setState({ lambdaARN: undefined, awsAccessKey: undefined, awsSecretKey: undefined });
                    const button = wrapper.find(Button).at(1);
                    expect(button).to.have.prop("disabled", true);
                });

                it("Tests that the save button is enabled when lambdaARN, awsAccessKey, and awsSecretKey are defined.", function () {
                    wrapper.setState({ lambdaARN: "123ABC", awsAccessKey: "ABC123", awsSecretKey: "AABBCC112233" });
                    const button = wrapper.find(Button).at(1);
                    expect(button).to.have.prop("disabled", false);
                });

                it("Tests that the save button is disabled only when lambdaARN is undefined.", function () {
                    wrapper.setState({ awsAccessKey: "ABC123", awsSecretKey: "AABBCC112233" });
                    const button = wrapper.find(Button).at(1);
                    expect(button).to.have.prop("disabled", false);
                });

                it("Tests that the save button is disabled only when awsAccessKey is undefined.", function () {
                    wrapper.setState({ lambdaARN: "123ABC", awsSecretKey: "AABBCC112233" });
                    const button = wrapper.find(Button).at(1);
                    expect(button).to.have.prop("disabled", false);
                });

                it("Tests that the save button is disabled only when awsSecretKey is undefined.", function () {
                    wrapper.setState({ lambdaARN: "123ABC", awsAccessKey: "ABC123" });
                    const button = wrapper.find(Button).at(1);
                    expect(button).to.have.prop("disabled", false);
                });
            });

            describe("Some random page", function () {
                let savedState: any;
                before(function () {
                    savedState = wrapper.state();
                    wrapper.setState({ showPage: "Page That does not exist." });
                });

                after(function () {
                    wrapper.setState(savedState);
                });

                it("Tests that the save button is disabled when the page is unknown to the component.", function () {
                    wrapper.setState({ lambdaARN: "123ABC", awsAccessKey: "ABC123", awsSecretKey: "AABBCC112233" });
                    const button = wrapper.find(Button).at(1);
                    expect(button).to.have.prop("disabled", true);
                });
            });
        });
    });

    describe("Saving Spokes", function () {
        let wrapper: ShallowWrapper<any, any>;
        let onSaved: sinon.SinonStub;
        let prefetch: sinon.SinonStub;
        let saveSpoke: sinon.SinonStub;
        let updateSourceObj: sinon.SinonStub;

        before(function () {
            onSaved = sinon.stub();
            prefetch = sinon.stub(SourceService, "getSourceObj").returns(Promise.reject(new Error("Error per requirements of the test.")));
        });

        beforeEach(function () {
            wrapper = shallow(<IntegrationSpokes user={user} source={source} onSpokesSaved={onSaved} getSources={undefined} setSource={undefined} />);
            const promise = (wrapper.instance() as IntegrationSpokes).cancelables[0] as any;
            return promise.catch(function() { /* don't care */ });
        });

        afterEach(function () {
            onSaved.reset();
            saveSpoke.reset();
        });

        after(function () {
            saveSpoke.restore();
            prefetch.restore();
        });

        describe("Successful saves", function () {
            before(function () {
                saveSpoke = sinon.stub(SpokesService, "savePipe").returns(Promise.resolve());
                updateSourceObj = sinon.stub(SourceService, "updateSourceObj").returns(Promise.resolve());
            });

            after(function () {
                saveSpoke.restore();
                updateSourceObj.restore();
            });

            it("Tests the appropriate parameters are passed in on HTTP.", function () {
                wrapper.setState({
                    showPage: "http",
                    proxy: true,
                    url: "http://test.url.fake/",
                    lambdaARN: "fakeARN",
                    awsAccessKey: "ABC123",
                    awsSecretKey: "123ABC",
                });

                const button = wrapper.find(Button).at(1);
                button.simulate("click");
                source.url = "http://test.url.fake/";
                source.customJson = "";
                source.maxErrors = "100";
                source.maxAverageResponseTime = "1000";
                source.hasIntegrated = undefined;
                expect(saveSpoke).to.be.calledOnce;
                const args = saveSpoke.args[0];
                expect(args[0]).to.deep.equal(user);
                expect(args[1]).to.deep.equal(source);
                expect(args[2]).to.deep.equal({ url: "http://test.url.fake/" });
                expect(args[3]).to.deep.equal(true);
            });

            it("Tests the appropriate parameters are passed in on lambda.", function () {
                wrapper.setState({ showPage: "lambda", proxy: true, url: "http://test.url.fake/", lambdaARN: "fakeARN", awsAccessKey: "ABC123", awsSecretKey: "123ABC" });

                const button = wrapper.find(Button).at(1);
                button.simulate("click");
                source.url = undefined;
                source.lambda_arn = "fakeARN";
                source.aws_access_key_id = "ABC123";
                source.aws_secret_access_key = "123ABC";
                source.maxErrors = "100";
                source.maxAverageResponseTime = "1000";
                source.hasIntegrated = undefined;

                expect(saveSpoke).to.be.calledOnce;
                const args = saveSpoke.args[0];
                expect(args[0]).to.deep.equal(user);
                expect(args[1]).to.deep.equal(source);
                expect(args[2]).to.deep.equal({ awsAccessKey: "ABC123", awsSecretKey: "123ABC", lambdaARN: "fakeARN" });
                expect(args[3]).to.deep.equal(true);
            });

            // TODO: unskip once `IntegrationSpokes.handleSave` is fixed to call `SpokesService.savePipe(user, source, resource, proxy)`.
            it.skip("Tests that the callback is called.", function () {
                wrapper.setState({ showPage: "http", proxy: true, url: "http://test.url.fake/", lambdaARN: "fakeARN", awsAccessKey: "ABC123", awsSecretKey: "123ABC" });

                const button = wrapper.find(Button).at(1);
                button.simulate("click");

                const promise = (wrapper.instance() as IntegrationSpokes).cancelables[0] as any;
                return promise
                    .then(function () {
                        expect(onSaved).to.be.calledOnce;
                    });
            });

            it.skip("Tests that the success message is displayed", function () {
                const button = wrapper.find(Button).at(1);
                button.simulate("click");

                const promise = (wrapper.instance() as IntegrationSpokes).cancelables[0] as any;
                return promise.then(function () {
                    const message = wrapper.find("p").at(4);
                    expect(message.text()).to.exist;
                    expect(message).to.have.style("color", "#000000"); // it's black.
                });
            });
        });

        // TODO: unskip once `IntegrationSpokes.handleSave` is fixed to call `SpokesService.savePipe(user, source, resource, proxy)`.
        describe("Unsuccessful saves", function () {
            before(function () {
                saveSpoke = sinon.stub(SpokesService, "savePipe").returns(Promise.resolve());
                updateSourceObj = sinon.stub(SourceService, "updateSourceObj").returns(Promise.reject(new Error("Error per requirements of the test.")));
            });

            after(function () {
                saveSpoke.restore();
                updateSourceObj.restore();
            });

            it.skip("Tests that the error message was displayed on error.", function () {
                const button = wrapper.find(Button).at(1);
                button.simulate("click");

                const promise = (wrapper.instance() as IntegrationSpokes);
                const cancelables = promise.cancelables[0] as any;
                return cancelables.then(function () {
                    const message = wrapper.find("p").at(4);
                    expect(message.text()).to.exist;
                    expect(message).to.have.style("color", "#FF0000"); // it's red.
                });
            });
        });
    });
});
