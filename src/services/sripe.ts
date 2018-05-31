import "isomorphic-fetch";
import { Query } from "../models/query";

const STRIPE_URL: string = process.env.NODE_ENV === "production"
    ? process.env.SOURCE_URL
    : "https://stripe-api-dev.bespoken.link/";

export async function postStripe(token: string, ): Promise<any> {
    const query: Query = new Query();
    query.add({ parameter: "token", value: token });
    const result: any = await fetch(STRIPE_URL, {
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
    console.log("result");
    console.log(result);
}
