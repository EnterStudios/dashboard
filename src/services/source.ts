import "isomorphic-fetch";

import { Query } from "../models/query";
import { Source } from "../models/source";
import { User } from "../models/user";
import { remoteservice } from "./remote-service";

export namespace source {

    const SOURCE_URL: string = process.env.SOURCE_URL
        ? process.env.SOURCE_URL
        : "https://source-api-dev.bespoken.tools/v1/";
    const NAME_GENERATING_URL: string = SOURCE_URL + "sourceId";
    const LINK_URL: string = SOURCE_URL + "linkSource";
    const VALIDATE_URL: string = SOURCE_URL + "validateSource";
    const CREATE_SOURCES_FROM_AMAZON: string = SOURCE_URL + "createSourcesFromAmazon";
    const AUTH_TOKEN_URL: string = SOURCE_URL + "authToken";
    export const LINK_AVS_URL: string = SOURCE_URL + "linkAVS";

    export interface SourceName {
        id: string;
        secretKey: string;
    }

    export interface LinkResult {
        user: {
            userId: string;
        };
        source: Source;
    }

    export interface AuthResult {
        authToken: string;
        newUser: boolean;
    }

    /**
     * A function that will generate a unique source name.
     * @param id
     *      An id to check against.  If not provided, a random name will be supplied.
     */
    export function generateSourceId(id?: string): Promise<SourceName> {
        const query: Query = new Query();
        if (id) {
            query.add({ parameter: "id", value: id });
        }

        const finalURL = NAME_GENERATING_URL + "?" + query.query();

        return fetch(finalURL)
            .then(function (result: any) {
                return result.json();
            }).then(function (result: SourceName) {
                return result;
            });
    }

    /**
     * This service will link the source to the given user.  It will transfer ownership to this user if the
     * source is not already owned by a user.
     *
     * @param sourceName The name and ID of the source.
     */
    export function linkSource(sourceName: SourceName, user: User): Promise<LinkResult> {
        const query: Query = new Query();
        query.add({ parameter: "source", value: sourceName });
        query.add({ parameter: "user", value: { userId: user.userId } });

        return fetch(LINK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: query.json()
        }).then(function (result: any) {
            if (result.status === 200) {
                return result.json();
            } else {
                return Promise.reject(new Error(result.statusText));
            }
        });
    }

    /**
     * This service will return an authorization token for a given email.  If the user does not exist,
     * it will create it first.
     *
     * @param email the user's email.
     * @param displayName the user's display name (optional)
     */
    export async function getAuthToken(email: string, displayName?: string): Promise<AuthResult> {
        const query: Query = new Query();
        query.add({ parameter: "email", value: email });
        query.add({ parameter: "displayName", value: displayName });

        const result: any = await fetch(AUTH_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: query.json()
        });

        if (result.status === 200) {
            return result.json();
        } else {
            return Promise.reject(new Error(result.statusText));
        }
    }

    export function createSource(source: Source, auth: remoteservice.auth.Auth = remoteservice.defaultService().auth(), db: remoteservice.database.Database = remoteservice.defaultService().database()): Promise<Source> {
        let user = auth.currentUser;
        let ref = db.ref();
        let sourcesPath = ref.child("sources");
        // Create a new mutable source from the source passed in
        const mutableSource: any = { ...{}, ...source };
        return generateSourceId(source.id)
            .then(function (idResult: SourceName) {
                mutableSource.id = idResult.id;
                mutableSource.secretKey = idResult.secretKey;
                mutableSource.members[user.uid] = "owner";
                return mutableSource;
            }).then(function (source: Source) {
                const sourceJSON = JSON.stringify(source);
                return sourcesPath.child(source.id).set(JSON.parse(sourceJSON))
                    .then(function () {
                        // Save the source to the user's list of sources
                        return ref.child("users").child(user.uid).child("sources").child(source.id).set("owner");
                    });
            }).then(function () {
                // And finally provide it back to the callback
                return mutableSource;
            }).catch((err: Error) => {
                console.log(err);
                throw err;
            });
    }

    export function deleteSource(source: Source, auth: remoteservice.auth.Auth = remoteservice.defaultService().auth(), db: remoteservice.database.Database = remoteservice.defaultService().database()): Promise<Source> {
        const user = auth.currentUser;
        const ref = db.ref();
        const key = source.id;

        // tslint:disable:no-null-keyword
        return ref.child("users").child(user.uid).child("sources").child(key).set(null).then(function () {
            return removeMembers(user.uid, source);
        });
        // tslint:enable:no-null-keyword
    }

    export function getSources(auth: remoteservice.auth.Auth = remoteservice.defaultService().auth(), db: remoteservice.database.Database = remoteservice.defaultService().database()): Promise<any> {
        let user = auth.currentUser;
        let ref = db.ref();

        return ref.child("/users/" + user.uid + "/sources").once("value");
    }

    export function getSourcesObj(auth: remoteservice.auth.Auth = remoteservice.defaultService().auth(), db: remoteservice.database.Database = remoteservice.defaultService().database()): Promise<Source[]> {
        let user = auth.currentUser;
        let ref = db.ref();

        return ref.child("/users/" + user.uid + "/sources").once("value")
            .then(function (retVal) {
                return (retVal.val()) ? Object.keys(retVal.val()) : [];
            }).then(function (keys: string[]) {
                let getPromises: Promise<Source>[] = [];
                for (let key of keys) {
                    getPromises.push(getSourceObj(key, db));
                }
                return Promise.all(getPromises);
            });
    }

    export function getSource(key: string, db: remoteservice.database.Database = remoteservice.defaultService().database()): Promise<any> {
        let ref = db.ref();
        return ref.child("/sources/" + key).once("value");
    }

    export function getSourceObj(key: string, db: remoteservice.database.Database = remoteservice.defaultService().database()): Promise<Source> {
        return getSource(key, db)
            .then(function (data) {
                if (data.val()) {
                    let source: Source = new Source(data.val());
                    return source;
                }
            })
            .catch((err: Error) => {
                // commenting for now until db is cleaned up
                // console.log(err);
                return undefined;
            });
    }

    export function updateSourceObj(source: Source, db: remoteservice.database.Database = remoteservice.defaultService().database()): Promise<Source> {
        return new Promise((resolve, reject) => {
            const sourceToSend: any = {
                name: source.name,
                monitoring_enabled: !!source.monitoring_enabled,
                proxy_enabled: !!source.proxy_enabled,
                validation_enabled: !!source.validation_enabled,
                debug_enabled: !!source.debug_enabled,
            };
            sourceToSend.url = source.url || "";
            sourceToSend.lambda_arn = source.lambda_arn || "";
            sourceToSend.aws_access_key_id = source.aws_access_key_id || "";
            sourceToSend.aws_secret_access_key = source.aws_secret_access_key || "";
            sourceToSend.customJson = source.customJson || "";
            sourceToSend.validation_script = source.validation_script || "";
            db.ref().child("/sources/" + source.id)
                .update(sourceToSend,
                (err: Error): firebase.Promise<any> => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                    return;
                });
        });
    }

    export function validateSource(userId: string, script: string, token: string,
        timestamp: number, vendorID: string, smAPIAccessToken: string,
        redirectURL: string): Promise<any> {
        const query: Query = new Query();
        query.add({ parameter: "user_id", value: userId });
        query.add({ parameter: "script", value: script });
        query.add({ parameter: "token", value: token });
        query.add({ parameter: "timestamp", value: timestamp });
        query.add({ parameter: "vendor_id", value: vendorID });
        query.add({ parameter: "sm_api_access_token", value: smAPIAccessToken });
        query.add({ parameter: "redirect_url", value: redirectURL });
        return fetch(VALIDATE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: query.json()
        }).then((result: any) => {
            if (result.status === 401) {
                return result;
            }
            return result.text();
        });
    }

    export async function createSkillsFromAmazon(userId: string, vendorId: string, SMAPIAccessToken: string): Promise<string[]> {
        const requestBody = JSON.stringify({
            "user_id": userId,
            "vendor_id": vendorId,
            "sm_api_access_token": SMAPIAccessToken,
        });
        try {
            const result: Response = await fetch(CREATE_SOURCES_FROM_AMAZON, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": process.env.SOURCE_API_ACCESS_TOKEN,
                },
                body: requestBody,
            }).catch(err => {
                return err;
            });
            const sources = await result.json();
            if (sources.length) {
                return Promise.resolve(sources);
            } else {
                return Promise.reject(new Error(result.statusText));
            }
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

export default source;

function removeMembers(memeberId: string, source: Source): Promise<Source> {
    return new Promise(function (resolve, reject) {
        const mutableSource: any = { ...{}, ...source };
        mutableSource.members[memeberId] = undefined;
        resolve(mutableSource);
    });
}
