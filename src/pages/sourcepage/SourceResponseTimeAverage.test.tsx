import * as chai from "chai";
import { shallow, ShallowWrapper } from "enzyme";
import * as moment from "moment";
import * as React from "react";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import IntervalChart from "../../components/Graphs/Line/IntervalChart";
import Query, {
  EndTimeParameter, IntervalParameter, QueryParameter, SourceParameter, StartTimeParameter
} from "../../models/query";
import Source from "../../models/source";
import LogService from "../../services/log";
import { dummySources } from "../../utils/test";
import SourceResponseTimeAverage from "./SourceResponseTimeAverage";

chai.use(sinonChai);
const expect = chai.expect;

const summary: LogService.ResponseTimeSummary[] = [
  {
    interval: "2017-06-7-3",
    avgResponseTime: 100,
  },
  {
    interval: "2017-06-7-4",
    avgResponseTime: 100,
  }];

describe("SourceTimeSummary", function () {

    let sources: Source[];
    let source: Source;

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

            wrapper = shallow(<SourceResponseTimeAverage
                source={source}
                startDate={start}
                endDate={end}
                interval={10} />);

            wrapper.setState({
                data: {data: [], ticks: []}
            });
        });

        it("Checks the response time graph is there.", function () {
            expect(wrapper.find(IntervalChart)).to.have.length(1);
        });

        it("Checks the response time graph has a default data of 0.", function () {
            expect(wrapper.find(IntervalChart).prop("data")).to.have.length(0); // One for each day.
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

            responseService = sinon.stub(LogService, "getResponseTimeSummary").returns(Promise.resolve(summary));
        });

        beforeEach(function () {
            responseService.reset();

            wrapper = shallow(<SourceResponseTimeAverage
                source={source}
                startDate={startTime}
                endDate={endTime}
                interval={10} />);
            const loadingPromise = (wrapper.instance() as SourceResponseTimeAverage).loadingPromise;
            return loadingPromise;
        });

        after(function () {
            responseService.restore();
        });

        it("Tests the data query contains the appropriate parameters.", function () {
            wrapper.setProps({ source: sources[1] }); // Forces a call to componentWillReceiveProps
            const loadingPromise = (wrapper.instance() as SourceResponseTimeAverage).loadingPromise;
            return loadingPromise.then(function () {
                const query: Query = responseService.args[1][0];
                const sourceParameter: SourceParameter = findQueryParameter(query, "source") as SourceParameter;
                const startParameter: StartTimeParameter = findQueryParameter(query, "start_time") as StartTimeParameter;
                const endParameter: EndTimeParameter = findQueryParameter(query, "end_time") as EndTimeParameter;
                const intervalParameter: IntervalParameter = findQueryParameter(query, "interval") as IntervalParameter;


                expect(startParameter.value).to.equal(startTime.toISOString());
                expect(endParameter.value).to.equal(endTime.toISOString());
                expect(sourceParameter.value).to.equal(sources[1].secretKey);
                expect(intervalParameter.value).to.equal(10);
            });
        });

        it("Tests that the data query does *not* load if the parameters are the same.", function () {
            wrapper.setProps({});
            let loadingPromise = (wrapper.instance() as SourceResponseTimeAverage).loadingPromise;
            return loadingPromise.then(function () {
                expect(responseService).to.be.calledOnce; // Only on mount.
            });
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
