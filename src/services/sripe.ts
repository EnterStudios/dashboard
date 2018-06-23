import "isomorphic-fetch";
import { Query } from "../models/query";
import { User } from "../models/user";

const STRIPE_URL: string = process.env.NODE_ENV === "production"
    ? process.env.STRIPE_API_URL
    : "https://localhost/";
// : "https://stripe-api-dev.bespoken.link/";

export async function postStripe(user: User, token: any, planToSubscribe: string): Promise<any> {
    const query: Query = new Query();

    query.add({ parameter: "userId", value: user.userId });
    query.add({ parameter: "token", value: token });
    query.add({ parameter: "planToSubscribe", value: planToSubscribe });
    query.add({ parameter: "stripeCustomerObjId", value: user.stripeCustomerObjId ? user.stripeCustomerObjId : undefined });
    query.add({ parameter: "email", value: user.email });
    query.add({ parameter: "updateSubscribedPlan", value: user.stripeSusbcribedPlanId ? true : false });
    query.add({
        parameter: "stripeSusbcribedPlanId", value: user.stripeSusbcribedPlanId ?
            user.stripeSusbcribedPlanId : undefined
    });
    const result: any = await fetch(STRIPE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: query.json()
    });

    console.error(result);
    console.error("....", result);

    if (result.status === 200) {
        return "operation success";
    }
    if (result.status === 401) {
        // return result;
        console.log(result.text());
        return "The request has not been applied because it lacks valid authentication ";
    }

    return result.text();
}
