import "isomorphic-fetch";

import Query from "../models/query";

namespace MonitoringService {

    export interface UpTimeSummary {
        source: string;
        status: string;
        timestamp: number;
    }

    export interface SourceStatus {
        source: string;
        status: string;
    }

    const BASE_URL = process.env.NODE_ENV === "production" ?
        process.env.MONITOR_API_URL :
        "http://209.177.90.133";

    export function getUpTimeSummary(query: Query, source: string): Promise < UpTimeSummary[] > {
        let url = BASE_URL + "/sources/" + source + "/pings?" + query.query();
        return fetchJson(url);
    }

    export function getSourceStatus(source: string): Promise < SourceStatus > {
        let url = BASE_URL + "/sources/" + source;
        return fetchJson(url);
    }

    function fetchJson(url: string): Promise < any > {
        const myHeaders = new Headers({
            "x-access-token": "114e2001-7549-4345-8133-22d3c01eccd4"
        });
        const myInit: RequestInit = {
            method: "GET",
            headers: myHeaders,
            mode: "cors",
            cache: "default"
        };
        return fetch(url, myInit).then(function (response) {
            return response.json();
        }).catch(function (err) {
            throw err;
        });
    }
}

export default MonitoringService;
