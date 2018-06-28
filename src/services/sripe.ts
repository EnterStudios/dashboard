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
    query.add({ parameter: "updateSubscribedPlan", value: user.stripeSubscribedPlanId ? true : false });
    query.add({ parameter: "stripeSubscribedPlanName", value: user.stripeSubscribedPlanName ? user.stripeSubscribedPlanName : undefined });
    query.add({
        parameter: "stripeSubscribedPlanId", value: user.stripeSubscribedPlanId ?
            user.stripeSubscribedPlanId : undefined
    });

    try {
        const result: any = await fetch(STRIPE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: query.json()
        });

        console.log("resultado", result);
        console.log(result.statusText);
        if (result.status === 200) {
            return "operation success";
        }
        if (result.status === 401) {
            return "The request has not been applied because it lacks valid authentication ";
        }
        if (result.status === 500) {
            return result.statusText;
        }
        console.error(result.text());

    } catch (error) {
        console.log("error...................");
        console.error(error);
    }
    return "Sorry there is an internal issue, Please try in another time or contact us.";

}
