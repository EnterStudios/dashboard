import * as chai from "chai";
import {mount, shallow, ShallowWrapper} from "enzyme";
import * as moment from "moment";
import * as React from "react";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import UpTimeChart from "../../components/Graphs/Line/UpTimeChart";
import Query, {
  EndTimeParameter, QueryParameter, StartTimeParameter
} from "../../models/query";
import Source from "../../models/source";
import MonitoringService from "../../services/monitoring";
import { dummySources } from "../../utils/test";
import SourceUpTime from "./SourceUptime";

chai.use(sinonChai);
const expect = chai.expect;
const jsdom = require("mocha-jsdom");

const summary: MonitoringService.UpTimeSummary[] = [
  {
    source: "source",
    status: "up",
    timestamp: moment().valueOf(),
  },
  {
    source: "source",
    status: "up",
    timestamp: moment().valueOf(),
  }];

describe("SourceTimeSummary", function () {

    let sources: Source[];
    let source: Source;
    jsdom();
    before(function () {
        sources = dummySources(2);
        source = sources[0];
    });

    describe("Renders", function () {
        let start: moment.Moment;
        let end: moment.Moment;
        let wrapper: ShallowWrapper<any, any>;

        before(function () {
            end = moment(new Date(2017, 3, 20, 11, 30, 10));
            start = moment(new Date(2017, 3, 13, 11, 30, 10));

            wrapper = shallow(<SourceUpTime
                source={source}
                startDate={start}
                endDate={end} />);
        });

        it("Checks the up time graph is there.", function () {
            expect(wrapper.find(UpTimeChart)).to.have.length(1);
        });

        it("Checks the up time graph has a default data of 0.", function () {
            expect(wrapper.find(UpTimeChart).prop("data")).to.have.length(0); // One for each day.
        });
    });

    describe("Source Not Found", function () {
        let startTime: moment.Moment;
        let endTime: moment.Moment;
        let responseService: sinon.SinonStub;
        let wrapper: any;

        before(function () {
            endTime = moment(new Date(2017, 2, 20));
            startTime = moment(new Date(2017, 2, 13));

            responseService = sinon.stub(MonitoringService, "getSourceStatus").returns(Promise.resolve());
        });

        beforeEach(function () {
            responseService.reset();

            wrapper = mount(<SourceUpTime
                source={source}
                startDate={startTime}
                endDate={endTime} />);
            const loadingPromise = (wrapper.instance() as SourceUpTime).loadingPromise;
            return loadingPromise;
        });

        after(function () {
            responseService.restore();
        });

        it("Checks the up time graph has a default when source is not found.", function () {
            wrapper.setState({data: {status: 2}});
            expect(wrapper.find("div").at(0).props().children).to.equal("No data available yet");
        });
    });

    describe("Loading", function () {
        let startTime: moment.Moment;
        let endTime: moment.Moment;
        let responseService: sinon.SinonStub;
        let wrapper: ShallowWrapper<any, any>;

        before(function () {
          endTime = moment(new Date(2017, 2, 20));
          startTime = moment(new Date(2017, 2, 13));

            responseService = sinon.stub(MonitoringService, "getUpTimeSummary").returns(Promise.resolve(summary));
        });

        beforeEach(function () {
            responseService.reset();

            wrapper = shallow(<SourceUpTime
                source={source}
                startDate={startTime}
                endDate={endTime} />);
            const loadingPromise = (wrapper.instance() as SourceUpTime).loadingPromise;
            return loadingPromise;
        });

        after(function () {
            responseService.restore();
        });

        it("Tests the data query contains the appropriate parameters when mounted.", function () {
            const query: Query = responseService.args[0][0];
            const startParameter: StartTimeParameter = findQueryParameter(query, "start_time") as StartTimeParameter;
            const endParameter: EndTimeParameter = findQueryParameter(query, "end_time") as EndTimeParameter;

            expect(startParameter.value).to.equal(startTime.valueOf());
            expect(endParameter.value).to.equal(endTime.valueOf());
        });

        it("Tests the data query contains the appropriate parameters.", function () {
            wrapper.setProps({ source: sources[1] }); // Forces a call to componentWillReceiveProps
            const loadingPromise = (wrapper.instance() as SourceUpTime).loadingPromise;
            return loadingPromise.then(function () {
                const query: Query = responseService.args[1][0];
                const startParameter: StartTimeParameter = findQueryParameter(query, "start_time") as StartTimeParameter;
                const endParameter: EndTimeParameter = findQueryParameter(query, "end_time") as EndTimeParameter;


                expect(startParameter.value).to.equal(startTime.valueOf());
                expect(endParameter.value).to.equal(endTime.valueOf());
            });
        });

        it("Tests that the data query does *not* load if the parameters are the same.", function () {
            wrapper.setProps({});
            let loadingPromise = (wrapper.instance() as SourceUpTime).loadingPromise;
            return loadingPromise.then(function () {
                expect(responseService).to.be.calledOnce; // Only on mount.
            });
        });

        it("Tests the defaults were set when source is undefined.", function () {
            const newWrapper = shallow(<SourceUpTime
                source={undefined}
                startDate={startTime}
                endDate={endTime} />);

            expect(newWrapper.find(UpTimeChart).prop("data")).to.have.length(0);
        });
    });
});

function findQueryParameter(q: Query, parameter: string): QueryParameter {
    for (let p of q.queryElements) {
        if (p.parameter === parameter) {
            return p;
        }
    }
    return undefined;
}
