import * as chai from "chai";
import { shallow, ShallowRendererProps, ShallowWrapper } from "enzyme";
import { Moment } from "moment";
import * as React from "react";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import Conversation from "../../models/conversation";
import ConversationList from "../../models/conversation-list";
import Log from "../../models/log";
import LogQuery from "../../models/log-query";
import Source from "../../models/source";
import { LogQueryEvent } from "../../reducers/log";
import BrowserUtils from "../../utils/browser";
import DateUtils from "../../utils/date";
import Interval from "../../utils/Interval";
import { dummyLogs, dummySources } from "../../utils/test";
import { ConvoListPage } from "./ConvoListPage";
import { DateFilter } from "./filters/ConvoFilters";
import { CompositeFilter } from "./filters/Filters";
import ConvoList from "./list/ConvoList";

chai.use(sinonChai);
const expect = chai.expect;

const iconStyle = {
    width: "100%",
    height: "100px"
};

const tooltip = "TestTooltip";

describe("ConvoListPage", function () {

    let source: Source;
    let logs: Log[];
    let nextPage: Log[];
    let baseConversations: ConversationList;
    let fullNextPageConvoersations: ConversationList;
    let getLogs: sinon.SinonStub;
    let newPage: sinon.SinonStub;
    let refresh: sinon.SinonStub;
    let onItemClick: sinon.SinonStub;
    let onIconClick: sinon.SinonStub;
    let isMobileWidth: sinon.SinonStub;

    before(function () {
        source = dummySources(1)[0];
        logs = dummyLogs(200);
        nextPage = dummyLogs(100);
        const both = logs.concat(nextPage);

        baseConversations = ConversationList.fromLogs(logs);
        fullNextPageConvoersations = ConversationList.fromLogs(logs);

        getLogs = sinon.stub().returns(Promise.resolve(logs));
        newPage = sinon.stub();
        newPage.onFirstCall().returns(Promise.resolve({ oldLogs: logs, newLogs: nextPage, total: both }))
            .onSecondCall().returns(Promise.resolve({ oldLogs: both, newLogs: [], total: both }));
        refresh = sinon.stub().returns(Promise.resolve({ oldLogs: logs, newLogs: nextPage, total: both }));

        onItemClick = sinon.stub();
        onIconClick = sinon.stub();

        isMobileWidth = sinon.stub(BrowserUtils, "isMobileWidth").returns(false);
    });

    afterEach(function () {
        getLogs.reset();
        newPage.reset();
        refresh.reset();
        onItemClick.reset();
        onIconClick.reset();
        isMobileWidth.reset();
    });

    after(function() {
        isMobileWidth.restore();
    });

    describe("Renders", function () {

        let filter: CompositeFilter<Conversation>;
        let wrapper: ShallowWrapper<any, any>;

        before(function () {
            filter = new CompositeFilter([]);
        });

        beforeEach(function () {
            let shallowProps: ShallowRendererProps = {
                context: { location: { query: { id: undefined } } }
            };
            wrapper = shallow(
                <ConvoListPage
                    source={undefined}
                    newPage={newPage}
                    refresh={refresh}
                    getLogs={getLogs}
                    onIconClick={onIconClick}
                    onItemClick={onItemClick}
                    filter={filter}
                    iconTooltip={tooltip}
                    iconStyle={iconStyle}
                />, shallowProps);
        });

        it("Tests the FilterableConvoList exists.", function () {
            expect(wrapper.find(ConvoList)).to.have.length(1);
        });

        it("Tests the FilterableConvoList has the appropriate props.", function () {
            const listWrapper = wrapper.find(ConvoList);
            expect(listWrapper).to.have.prop("filter", filter);
            expect(listWrapper).to.have.prop("iconTooltip", tooltip);
            expect(listWrapper.prop("iconStyle")).to.equal(iconStyle); // The have.prop method seems to be different.
        });

        it("Tests that the \"getLogs\" is called props recieved", function () {
            wrapper.setProps({ source: source });
            expect(getLogs).to.be.calledOnce;
        });

        describe("getLogs", function () {

            let dateFilter: DateFilter;

            before(function () {
                dateFilter = new DateFilter(DateUtils.daysAgo(5), DateUtils.daysAgo(2));
                filter = filter.copyAndAddOrReplace(dateFilter);
            });

            beforeEach(function () {
                let shallowProps: ShallowRendererProps = {
                    context: { location: { query: { id: undefined } } }
                };
                wrapper = shallow(
                    <ConvoListPage
                        source={undefined}
                        newPage={newPage}
                        refresh={refresh}
                        getLogs={getLogs}
                        filter={filter}
                    />, shallowProps);
            });

            it("Tests that the LogQuery is correct when a DateFilter is applied.", function () {
                // In the real world, "componentWillReceiveProps" is called, but not in Enzyme.
                Promise.resolve(true).then(function () {
                    wrapper.setProps({ source: source });
                }).then(function () {
                    const logQuery: LogQuery = getLogs.args[0][0];
                    expect((logQuery.startTime as Moment).toDate()).to.equalDate(dateFilter.startDate);
                    expect((logQuery.endTime as Moment).toDate()).to.equalDate(dateFilter.endDate);
                });
            });

            it("Tests that the \"getLogs\" is not called when source is undefined.", function () {
                Promise.resolve(true).then(function () {
                    wrapper.setProps({ source: source });
                }).then(function () {
                    wrapper.setProps({ source: undefined });
                }).then(function () {
                    expect(getLogs).to.have.been.calledOnce; // Only the first time.
                });

            });

            it("Tests that the logs are cleared when going from a source to an undefined source.", function () {
                Promise.resolve(true).then(function () {
                    wrapper.setProps({ source: source });
                }).then(function () {
                    wrapper.setProps({ source: undefined });
                }).then(function () {
                    const listWrapper = wrapper.find(ConvoList).at(0);
                    expect(listWrapper.prop("conversations")).to.deep.equal([]);
                });
            });

            it("Tests that the logs are not recovered when setting props with the same source.", function () {
                Promise.resolve(true).then(function () {
                    wrapper.setProps({ source: source });
                }).then(function () {
                    wrapper.setProps({ source: source });
                }).then(function () {
                    wrapper.setProps({ source: source });
                }).then(function () {
                    expect(getLogs).to.have.been.calledOnce;
                });
            });

            it("Tests that the logs are gathered when finding a different source.", function () {
                Promise.resolve(true).then(function () {
                    wrapper.setProps({ source: source });
                }).then(function () {
                    const newSource = dummySources(2)[1]; // The second one will have a different ID than the first.
                    wrapper.setProps({ source: newSource });
                }).then(function () {
                    expect(getLogs).to.have.been.calledTwice;
                });
            });
        });
    });

    describe("Actions", function () {
        let filter: CompositeFilter<Conversation>;
        let wrapper: ShallowWrapper<any, any>;
        let listWrapper: ShallowWrapper<any, any>;

        before(function () {
            filter = new CompositeFilter([]);
        });

        beforeEach(function () {
            let shallowProps: ShallowRendererProps = {
                context: { location: { query: { id: undefined } } }
            };
            wrapper = shallow(
                <ConvoListPage
                    source={undefined}
                    newPage={newPage}
                    refresh={refresh}
                    getLogs={getLogs}
                    onIconClick={onIconClick}
                    onItemClick={onItemClick}
                    filter={filter}
                />, shallowProps);

            return Promise.resolve(true).then(function () {
                wrapper.setProps({ source: source });
            }).then(function () {
                listWrapper = wrapper.find(ConvoList);
            });
        });

        it("Tests that iconClick triggers an event", function () {
            listWrapper.simulate("iconClick", baseConversations[0]);

            expect(onIconClick).to.have.been.calledOnce;
            expect(onIconClick).to.have.been.calledWith(baseConversations[0]);
        });

        it("Tests that the itemClick triggers an event", function () {
            listWrapper.simulate("itemClick", baseConversations[0]);

            expect(onItemClick).to.have.been.calledOnce;
            expect(onItemClick).to.have.been.calledWith(baseConversations[0]);
        });
    });

    describe("Scrolling", function () {
        let filter: CompositeFilter<Conversation>;
        let wrapper: ShallowWrapper<any, any>;
        let listWrapper: ShallowWrapper<any, any>;

        before(function () {
            filter = new CompositeFilter([]);
        });

        beforeEach(function () {
            let shallowProps: ShallowRendererProps = {
                context: { location: { query: { id: undefined } } }
            };
            wrapper = shallow(
                <ConvoListPage
                    source={undefined}
                    newPage={newPage}
                    refresh={refresh}
                    getLogs={getLogs}
                    onIconClick={onIconClick}
                    onItemClick={onItemClick}
                    filter={filter}
                />, shallowProps);

            wrapper.setState({
                lastLogs: logs,
                query: new LogQuery({ source: source })
            });
            listWrapper = wrapper.find(ConvoList);
        });

        it("Tests that the scroll will query a next page.", function () {
            // Have to wait for the "getLogs" pass to finish so the state is updated.
            return Promise.resolve(true).then(function () {
                listWrapper.simulate("scroll", 0, 6, 10);
            }).then(function () {
                expect(newPage).to.have.been.calledOnce;

                const queryEvent = newPage.args[0][0] as LogQueryEvent;
                const limit = newPage.args[0][1] as number;

                expect(limit).to.equal(50);
                expect(queryEvent.logs.length).to.equal(logs.length);
                expect(queryEvent.query.source).to.equal(source);
            });
        });

        it("Tests that the scroll will not query the next page if it's not within range", function () {
            return Promise.resolve(true).then(function () {
                listWrapper.simulate("scroll", 0, 3, 10);
            }).then(function () {
                expect(newPage).to.have.not.been.called;
            });
        });
    });

    describe("Tests the refreshing.", function () {

        let wrapper: ShallowWrapper<any, any>;
        let stubExecutor: StubExecutor;
        let intervalStub: sinon.SinonStub;

        before(function () {
            intervalStub = sinon.stub(Interval, "newExecutor", (ms: number, callback: () => void): Interval.Executor => {
                return stubExecutor = new StubExecutor(ms, callback);
            });
        });

        beforeEach(function () {
            let shallowProps: ShallowRendererProps = {
                context: { location: { query: { id: undefined } } }
            };
            wrapper = shallow(
                <ConvoListPage
                    source={source}
                    newPage={newPage}
                    refresh={refresh}
                    getLogs={getLogs}
                    onIconClick={onIconClick}
                    onItemClick={onItemClick}
                    refreshOn={true}
                />, shallowProps);
        });

        afterEach(function () {
            stubExecutor.reset();
            intervalStub.reset();
        });

        after(function () {
            intervalStub.restore();
        });

        it.skip("Tests there is a value and callback passed to the exectuor.", function () {
            expect(stubExecutor).to.exist;
            expect(stubExecutor.ms).to.be.greaterThan(0);
            expect(stubExecutor.callback).to.exist;
        });

        it.skip("Tests the interval executor is ended when unmounted.", function () {
            wrapper.unmount();
            expect(stubExecutor.end).to.have.been.calledOnce;
        });

        it.skip("Tests the callback when the executor executes the callback.", function () {
            stubExecutor.callback();
            expect(refresh).to.have.been.calledOnce;
        });
    });
});

class StubExecutor implements Interval.Executor {

    callback: () => void;
    ms: number;

    start: sinon.SinonStub;
    end: sinon.SinonStub;

    constructor(ms: number, callback: () => void) {
        this.callback = callback;
        this.ms = ms;
        this.start = sinon.stub();
        this.end = sinon.stub();
    }

    reset() {
        this.start.reset();
        this.end.reset();
    }
}
