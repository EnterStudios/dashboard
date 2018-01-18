import * as chai from "chai";
import * as fetchMock from "fetch-mock";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import * as SourceModel from "../models/source";
import User from "../models/user";
import remoteservice from "./remote-service";
import SourceService from "./source";

chai.use(sinonChai);
let expect = chai.expect;

/**
 * Convience method to generate the props with a unique ID.
 *
 * @param {string} The ID to put.
 */
function generateSourceProps(sourceId: string = undefined, members: SourceModel.Members = {}): SourceModel.SourceProperties {
    let props: SourceModel.SourceProperties = {
        secretKey: "SuperSecretKey",
        name: "Test Source",
        members: members,
        id: sourceId,
        created: new Date(),
        url: "https://romantic-shelley-8zIRae.bespoken.link",
        aws_secret_access_key: "",
        aws_access_key_id: "",
        lambda_arn: "",
        monitoring_enabled: false,
        proxy_enabled: true,
        debug_enabled: true,
    };
    return props;
};

/**
 * The User to be defined as the current logged in user.
 */
let mockUser: remoteservice.user.User = {
    emailVerified: true,
    displayName: "testUsers",
    email: "test@testdomain.test",
    photoURL: undefined,
    providerId: "ABC123",
    uid: "ABCD1234567890",
    sendEmailVerification: undefined
};

/**
 * A promise to simulate the database returning a single source along with the other objects it may
 * return as well.
 */
function successResponseSourcePromise(id?: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        resolve({
            code: 200,
            val(): any {
                return generateSourceProps(id);
            }
        });
    });
}

/**
 * A promise to simulate the database returning a collection of sources along with the other objects it may
 * return as well.
 */
function successResponseSourcesArrayPromise(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        let objs: SourceModel.SourceProperties[] = [];

        for (let i = 0; i < 10; ++i) {
            objs.push(generateSourceProps("TestSourceId" + i));
        }

        resolve({
            code: 200,
            val(): any {
                return objs;
            }
        });
    });
}

/**
 * A response promise that will return the response given when requesting all the owned sources.
 */
function successGetOwnedSourcesPromise(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        let obj: any = {};

        for (let i = 0; i < 10; ++i) {
            obj["TestSourceId" + i] = "owner";
        }
        resolve({
            val(): any {
                return obj;
            }
        });
    });
}

function successResponsePromise(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        resolve({
            code: 200,
            message: "Success"
        });
    });
}

function errorResponsePromise(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        reject(Error("Error thrown per requirements of the test."));
    });
}

const mockAuth: remoteservice.auth.Auth = <remoteservice.auth.Auth>{
    get currentUser() {
        return mockUser;
    }
};

describe("Source Service", function () {

    let db: remoteservice.database.Database;
    let ref: remoteservice.database.Reference;

    beforeEach(function () {
        db = <remoteservice.database.Database>{};
        ref = <remoteservice.database.Reference>{};

        db.ref = sinon.stub().returns(ref);
        ref.child = sinon.stub().returns(ref);
    });

    describe("Tests the Link Source function", function () {
        let mockResponse: any;
        let fullSource: SourceModel.Source;
        let sourceName: SourceService.SourceName;
        let user: User;

        before(function () {
            sourceName = { id: "ABC123", secretKey: "SuperSecretKey" };
            fullSource = new SourceModel.Source({
                id: sourceName.id,
                secretKey: sourceName.secretKey,
                name: "Test Source",
                url: "https://romantic-shelley-8zIRae.bespoken.link",
                aws_secret_access_key: "",
                aws_access_key_id: "",
                lambda_arn: "",
                monitoring_enabled: false,
                proxy_enabled: true,
                debug_enabled: true,
            });
            user = new User({ userId: "TestUserID", email: "test@test.com", emailVerified: false });
            mockResponse = { user: { userId: user.userId }, source: fullSource };
            fetchMock.post(/https:\/\/source-api\.bespoken\.tools\/v1\/linkSource/, mockResponse);
        });

        afterEach(function () {
            fetchMock.reset();
        });

        after(function () {
            fetchMock.restore();
        });

        it("Tests that the appropriate headers are sent.", function () {
            return SourceService.linkSource(sourceName, user)
                .then(function (value: SourceService.LinkResult) {
                    const args = fetchMock.lastCall()[1] as RequestInit;
                    const header = args.headers;
                    expect(args.method).to.equal("POST");
                    expect(header["Content-Type"]).to.equal("application/json");
                });
        });

        it("Tests the appropriate body is sent", function () {
            return SourceService.linkSource(sourceName, user)
                .then(function (value: SourceService.LinkResult) {
                    const args = fetchMock.lastCall()[1] as RequestInit;
                    const body = JSON.parse(args.body);
                    expect(body.source).to.deep.equal(sourceName);
                    expect(body.user.userId).to.equal(user.userId);
                });
        });

        it("Tests that the return value is good.", function () {
            return SourceService.linkSource(sourceName, user)
                .then(function (value: SourceService.LinkResult) {
                    expect(value.user.userId).to.equal(user.userId);
                    expect(value.source).to.deep.equal(fullSource);
                });
        });

        describe("400 response", function () {
            let errorResponse: Response;

            before(function () {
                errorResponse = new Response(undefined, { status: 400, statusText: "Error per requirement of the test." });
                fetchMock.restore();
                fetchMock.post(/https:\/\/source-api\.bespoken\.tools\/v1\/linkSource/, errorResponse);
            });

            after(function () {
                fetchMock.restore();
                fetchMock.post(/https:\/\/source-api\.bespoken\.tools\/v1\/linkSource/, mockResponse);
            });

            it("Tests that an error is thrown to the catch.", function () {
                let caughtError: Error;
                return SourceService.linkSource(sourceName, user)
                    .catch(function (err: Error) {
                        caughtError = err;
                    }).then(function () {
                        expect(caughtError).to.exist;
                    });
            });
        });

        describe("Thrown error", function () {
            let errorResponse: () => Promise<any>;

            before(function () {
                errorResponse = () => { return Promise.reject("Error per requirements of the test."); };
                fetchMock.restore();
                fetchMock.post(/https:\/\/source-api\.bespoken\.tools\/v1\/linkSource/, errorResponse);
            });

            after(function () {
                fetchMock.restore();
                fetchMock.post(/https:\/\/source-api\.bespoken\.tools\/v1\/linkSource/, mockResponse);
            });

            it("Tests that an error is thrown to the catch.", function () {
                let caughtError: Error;
                return SourceService.linkSource(sourceName, user)
                    .catch(function (err: Error) {
                        caughtError = err;
                    }).then(function () {
                        expect(caughtError).to.exist;
                    });
            });
        });
    });

    describe("Tests the generate source ID function.", function () {
        let mockResponse: any;

        before(function () {
            mockResponse = { id: "test-source-bhjas3", secretKey: "ABC123456" };
            fetchMock.get(/https:\/\/source-api\.bespoken\.tools\/v1\/sourceId\?.*/, mockResponse);
        });

        after(function () {
            fetchMock.restore();
        });

        it("Tests the resource is returned.", function () {
            return SourceService.generateSourceId()
                .then(function (resource: SourceService.SourceName) {
                    expect(resource).to.exist;
                    expect(resource.id).to.equal("test-source-bhjas3");
                    expect(resource.secretKey).to.equal("ABC123456");
                });
        });
    });

    describe("Tests the createSource function.", function () {

        describe("Tests successful create responses.", function () {

            let mockResponse: any;

            before(function () {
                mockResponse = {
                    id: "test-source-bhjas3",
                    secretKey: "ABC123456",
                    url: "https://romantic-shelley-8zIRae.bespoken.link",
                    aws_secret_access_key: "",
                    aws_access_key_id: "",
                    lambda_arn: "",
                    monitoring_enabled: false,
                    proxy_enabled: true,
                    debug_enabled: true,
                };
                fetchMock.get(/https:\/\/source-api\.bespoken\.tools\/v1\/sourceId\?.*/, mockResponse);
            });

            beforeEach(function () {
                ref.set = sinon.stub().returns(successResponsePromise());
            });

            after(function () {
                fetchMock.restore();
            });

            it("Creates a new Source", function () {
                return SourceService.createSource(new SourceModel.Source(generateSourceProps()), mockAuth, db)
                    .then(function (source: SourceModel.Source) {
                        expect(source.id).to.equal("test-source-bhjas3"); // "The default "slugged" name is the source name made in to a URL format.
                        expect(source.secretKey).to.equal("ABC123456");
                        expect(source.members[mockAuth.currentUser.uid]).to.equal("owner");
                    });
            });

            it("Sends the appropriate source to Firebase.", function () {
                return SourceService.createSource(new SourceModel.Source(generateSourceProps()), mockAuth, db)
                    .then(function (source: SourceModel.Source) {
                        // In order for these to be set, the firebase url "/sources/<sourceID>" must be set to "source" (checked above)
                        // Immediately following the setting, the firebase url "users/<userID>/sources/<sourceID>" must be set to "owner"
                        const childArgs = (ref.child as sinon.SinonStub).args;
                        const setargs = (ref.set as sinon.SinonStub).args;
                        // Check the first setting.
                        expect(childArgs[0][0]).to.equal("sources");
                        expect(childArgs[1][0]).to.equal("test-source-bhjas3");
                        expect(setargs[0][0]).to.deep.equal(source);

                        // Check the second setting.
                        expect(childArgs[2][0]).to.equal("users");
                        expect(childArgs[3][0]).to.equal(mockAuth.currentUser.uid);
                        expect(childArgs[4][0]).to.equal("sources");
                        expect(childArgs[5][0]).to.equal("test-source-bhjas3");
                        expect(setargs[1][0]).to.equal("owner");
                    });
            });
        });

        describe("Tests unsuccessful create response.", function () {
            let createSourceError = new Error("First argument contains undefined in property 'sources.naughty-orwell-s5mdjF.url'");

            before(function () {
                fetchMock.get(/https:\/\/source-api\.bespoken\.tools\/v1\/sourceId\?.*/, new Promise((resolve, reject) => {
                    reject(createSourceError);
                }));
            });

            it("Throws error", function () {
                return SourceService.createSource(new SourceModel.Source(generateSourceProps()), mockAuth, db)
                    .catch((err: Error) => {
                        expect(err).to.not.be.undefined;
                    });
            });
        });

    });

    describe("Tests the \"deleteSource\" function.", function () {
        let childStub: sinon.SinonStub;
        let setStub: sinon.SinonStub;
        let source = generateSourceProps();

        beforeEach(function () {
            const owner: SourceModel.Members = {};
            owner[mockUser.uid] = "owner";
            owner["123ABC"] = "visitor";
            owner["234BCD"] = "visitor";
            owner["345CDE"] = "visitor";
            owner["456DEF"] = "visitor";

            childStub = sinon.stub().returns(ref);
            setStub = sinon.stub().returns(successResponsePromise());
            source = generateSourceProps("ABC123", owner);

            ref.child = childStub;
            ref.set = setStub;
        });

        describe("Success", function () {
            it("Tests the delete when to the appropriate Firebase url.", function () {
                return SourceService.deleteSource(new SourceModel.Source(source), mockAuth, db)
                    .then(function (source: SourceModel.Source) {
                        // Deleting happens at "users/<uid>/sources/<source.id>";
                        const firstCall = childStub.firstCall;
                        expect(firstCall).to.be.calledWith("users");

                        const secondCall = childStub.secondCall;
                        expect(secondCall).to.be.calledWith(mockAuth.currentUser.uid);

                        const thirdCall = childStub.thirdCall;
                        expect(thirdCall).to.be.calledWith("sources");

                        const fourthCall = childStub.getCall(3);
                        expect(fourthCall).to.be.calledWith(source.id);

                    });
            });

            it("Tests the delete sent a null to the Firebase url.", function () {
                return SourceService.deleteSource(new SourceModel.Source(source), mockAuth, db)
                    .then(function (source: SourceModel.Source) {
                        // tslint:disable:no-null-keyword
                        expect(setStub).to.be.calledWith(null);
                        // tslint:enable:no-null-keyword
                    });
            });

            it("Tests the returned source has been updated.", function () {
                return SourceService.deleteSource(new SourceModel.Source(source), mockAuth, db)
                    .then(function (source: SourceModel.Source) {
                        expect(source.members[mockUser.uid]).to.not.exist;
                    });
            });
        });

        describe("Unsuccessful", function () {

        });
    });

    describe("Tests the \"getSources\" function.", function () {
        it("Tests the get sources function with a successful payload.", function () {
            ref.once = sinon.stub().returns(successResponseSourcesArrayPromise());

            return SourceService.getSources(mockAuth, db).then(function (retVal: any) {
                expect(ref.child).to.be.calledWith("/users/" + mockUser.uid + "/sources");
                expect(retVal).to.not.be.undefined;
            });
        });

        it("Tests the get sources function with a successful payload.", function () {
            ref.once = sinon.stub().returns(errorResponsePromise());

            return SourceService.getSources(mockAuth, db).catch(function (retVal: any) {
                expect(ref.child).to.be.calledWith("/users/" + mockUser.uid + "/sources");
                expect(retVal).to.not.be.undefined;
            });
        });
    });

    describe("Tests the \"getSourcesObj\" function.", function () {

        /**
         * The "getSource" must return an individual source from the url "/source/{sourceId}" so we're
         * going to put that in to the stub for each available source.
         */
        beforeEach(function () {
            let mainStub: sinon.SinonStub = sinon.stub().withArgs("/sources/").returns(errorResponsePromise());
            for (let i = 0; i < 10; i++) {
                let subRef = <remoteservice.database.Reference>{};
                subRef.once = sinon.stub().returns(successResponseSourcePromise("TestSourceId" + i));

                // First call should be the call to get all object keys.  All subsequent calls should be to get the actual object.
                mainStub.onCall(i + 1).returns(subRef);
                // mainStub.withArgs("/sources/TestSourceId" + i).returns(subRef);
            }
            ref.child = mainStub;
        });

        it("Tests the get sources object function with a successful payload.", function () {
            let subRef = <remoteservice.database.Reference>{};
            subRef.once = sinon.stub().returns(successGetOwnedSourcesPromise());

            (<sinon.SinonStub>ref.child).onFirstCall().returns(subRef);

            return SourceService.getSourcesObj(mockAuth, db).then(function (sources: SourceModel.Source[]) {
                expect(ref.child).to.be.callCount(11);
                expect(ref.child).to.be.calledWith("/users/" + mockUser.uid + "/sources");
                expect(sources.length).to.equal(10); // The side that the main promise returns.
            });
        });

        it("Tests the get sources function with an unsuccessful payload.", function () {
            let subRef = <remoteservice.database.Reference>{};
            subRef.once = sinon.stub().returns(errorResponsePromise());

            (<sinon.SinonStub>ref.child).returns(subRef);

            return SourceService.getSourcesObj(mockAuth, db).catch(function (retVal: any) {
                expect(ref.child).to.be.callCount(1);
                expect(ref.child).to.be.calledWith("/users/" + mockUser.uid + "/sources");
                expect(retVal).to.not.be.undefined;
            });
        });
    });

    describe("Testing the \"getSource\" method.", function () {

        it("Tests a successful response for Get Source.", function () {

            ref.once = sinon.stub().returns(successResponseSourcePromise("TestSourceId"));

            return SourceService.getSource("TestSourceId", db).then(function (obj: any) {
                expect(ref.once).to.be.calledOnce;
                expect(ref.child).to.be.calledOnce;
                expect(ref.child).to.be.calledWith("/sources/TestSourceId");
                expect(obj).to.not.be.undefined;
                expect(obj.val()).to.not.be.undefined;
            });
        });

        it("Tests an unsuccessful response for Get Source.", function () {

            ref.once = sinon.stub().returns(errorResponsePromise());

            return SourceService.getSource("TestSourceId", db).catch(function (obj: any) {
                expect(ref.once).to.be.calledOnce;
                expect(ref.child).to.be.calledOnce;
                expect(ref.child).to.be.calledWith("/sources/TestSourceId");
                expect(obj).to.not.be.undefined;
                expect(obj).to.be.a("Error");
            });
        });
    });

    describe("Testing the \"getSourceObj\" method.", function () {

        it("Tests a successful response for Get Source.", function () {

            ref.once = sinon.stub().returns(successResponseSourcePromise("TestSourceId"));

            return SourceService.getSourceObj("TestSourceId", db).then(function (obj: SourceModel.Source) {
                expect(ref.once).to.be.calledOnce;
                expect(ref.child).to.be.calledOnce;
                expect(ref.child).to.be.calledWith("/sources/TestSourceId");
                expect(obj).to.not.be.undefined;
                expect(obj.id).to.equal("TestSourceId");
            });
        });

        it("Tests an unsuccessful response for Get Source.", function () {

            ref.once = sinon.stub().returns(errorResponsePromise());

            return SourceService.getSourceObj("TestSourceId", db).catch(function (obj: any) {
                expect(ref.once).to.be.calledOnce;
                expect(ref.child).to.be.calledOnce;
                expect(ref.child).to.be.calledWith("/sources/TestSourceId");
                expect(obj).to.not.be.undefined;
                expect(obj).to.be.a("Error");
            });
        });
    });

    describe("Tests the  \"getAuthToken\" method.", function () {
        let mockResponse: SourceService.AuthResult;

        before(function () {
            mockResponse = { authToken: "an auth token", newUser: true };
            fetchMock.post(/https:\/\/source-api\.bespoken\.tools\/v1\/authToken/, mockResponse);
        });

        after(function () {
            fetchMock.restore();
        });

        it("Tests the auth token is returned.", async function () {
            const authResult: SourceService.AuthResult = await SourceService.getAuthToken("anEmail@test.com", "a display name");
            expect(authResult).to.exist;
            expect(fetchMock.called()).to.equal(true);
            expect(authResult.newUser).to.equal(true);
        });
    });
});
