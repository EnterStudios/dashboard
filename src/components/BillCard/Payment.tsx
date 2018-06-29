import { RouterAction } from "react-router-redux";
import { User, UserDetails, UserProperties } from "../../models/user";
import auth from "../../services/auth";
import { postStripe } from "../../services/sripe";
const ReactStripeElements = require("react-stripe-elements");
const PaymentStyle = require("./PaymentStyle.scss");

const {
    StripeProvider,
    Elements,
    injectStripe,
    CardNumberElement,
    CardExpiryElement,
    CardCVCElement,
    PostalCodeElement,
} = ReactStripeElements;

const createOptions = (fontSize: string) => {
    return {
        style: {
            base: {
                fontSize,
                color: "#424770",
                letterSpacing: "0.025rem",
                fontFamily: "Source Code Pro, monospace",
                "::placeholder": {
                    color: "#aab7c4",
                },
            },
            invalid: {
                color: "#9e2146",
            },
        },
    };
};

export interface SplitFormCProps {
    fontSize: string;
    subscriptionUpdate: boolean;
    user: User;
    planId: string;
    userDetail: UserDetails;
    goTo: (uri: String) => RouterAction;
}


class SplitFormC extends React.Component<any & SplitFormCProps, any> {
    constructor() {
        super();
        this.state = {
            stripe: undefined,
            message: undefined,
        };
    }

    redirect = () => {
        if (this.props.goTo)
            this.props.goTo("/skills");
    }

    setStripe = async (tokenId: any) => {
        const userProperties: UserProperties = {
            email: this.props.user.email,
            userId: this.props.user.userId,
            stripeCustomerObjId: this.props.userDetail.stripeCustomerObjId ?
                this.props.userDetail.stripeCustomerObjId : undefined,
            stripeSubscribedPlanId: this.props.userDetail.stripeSubscribedPlanId ?
                this.props.userDetail.stripeSubscribedPlanId : undefined,
            stripeSubscribedPlanName: this.props.userDetail.stripeSubscribedPlanName ?
                this.props.userDetail.stripeSubscribedPlanName : undefined,
        };
        const user = new User(userProperties);
        const planToSubscribe = this.props.planId;
        this.setState({
            message: "Loading..."
        });
        const helper = await postStripe(user, tokenId, planToSubscribe);
        this.setState({
            message: helper
        });
        if (helper === "operation success") {

            setTimeout(() => {
                this.redirect();
            }, 3500);
        }
    }

    handleSubmit = (ev: any) => {
        ev.preventDefault();
        if (this.props.stripe) {

            if (this.props.subscriptionUpdate) {
                this.setStripe(undefined);
            } else {

                this.props.stripe
                    .createToken()
                    .then(async (payload: any) => {

                        if (payload.token) {

                            this.setStripe(payload.token.id);

                        } else {
                            console.error("fail to try to create a token ", payload);
                            this.setState({
                                message: payload.error.message
                            });
                        }
                    });
            }
        } else {
            this.setState({
                message: "Stripe.js hasnt loaded yet."
            });
            console.error("Stripe.js hasnt loaded yet.");
        }
    }
    render() {
        const { message } = this.state;
        const subscriptionUpdate = this.props.subscriptionUpdate;
        let messageStyle = (message === "operation success") ? PaymentStyle.success : PaymentStyle.invalid;
        if (message === "Loading...") {
            messageStyle = PaymentStyle.Loading;
        }

        return (
            <div className={PaymentStyle.cardPayment}>
                <form onSubmit={this.handleSubmit}>
                    {subscriptionUpdate ?
                        <fieldset className={PaymentStyle.fake_form} >
                            <div><b>Payment form </b></div>
                            <div>
                                <label>Card number</label>
                                <div>**** **** **** 1234</div>
                                <label>Expiration date</label>
                                <div>{"MM / YY"}</div>
                                <label>CVC</label>
                                <div> CVC </div>
                                <label>Postal code</label>
                                <div>*****</div>
                            </div>
                            <button className={PaymentStyle.botton}>{"Update Subscription"}</button>
                        </fieldset>
                        :
                        <fieldset >
                            <div><b>Payment form </b></div>
                            <div>
                                <label>{"Card number"}
                                    <CardNumberElement {...createOptions(this.props.fontSize)} />
                                </label>
                                <label>{"Expiration date"}
                                    <CardExpiryElement
                                        {...createOptions(this.props.fontSize)}
                                    />
                                </label>
                                <label>{"CVC"}
                                    <CardCVCElement
                                        {...createOptions(this.props.fontSize)}
                                    />
                                </label>
                                <label>{"Postal code"}
                                    <PostalCodeElement
                                        {...createOptions(this.props.fontSize)}
                                    />
                                </label>
                            </div>
                            <button className={PaymentStyle.botton}>{"Subscribe"}</button>
                        </fieldset>
                    }
                </form>
                <div><label className={messageStyle}> <b> {message}</b></label></div>
            </div>
        );
    }
}
const SplitForm = injectStripe(SplitFormC);

export interface PaymentFormProps {
    planId: string;
    user: User;
    goTo: (uri: String) => RouterAction;
}

export class PaymentForm extends React.Component<PaymentFormProps, any> {

    constructor() {
        super();

        this.state = {
            stripe: undefined,
            elementFontSize: window.innerWidth < 450 ? "14px" : "18px",
        };
        window.addEventListener("resize", () => {
            if (window.innerWidth < 450 && this.state.elementFontSize !== "14px") {
                this.setState({ elementFontSize: "14px" });
            } else if (
                window.innerWidth >= 450 &&
                this.state.elementFontSize !== "18px"
            ) {
                this.setState({ elementFontSize: "18px" });
            }

        });
    }

    async componentDidMount() {
        if ((window as any).Stripe) {
            this.setState({ stripe: (window as any).Stripe("pk_test_pjtrb20eQPAtLomXsm4sopuW") });
        } else {
            document.querySelector("#stripe-js").addEventListener("load", () => {
                // Create Stripe instance once Stripe.js loads
                this.setState({ stripe: (window as any).Stripe("pk_test_pjtrb20eQPAtLomXsm4sopuW") });
            });

        }
        this.setState({
            userDetail: await auth.currentUserDetails(),
        });
    }

    render() {
        const { elementFontSize, userDetail } = this.state;
        const stripeSubscribedPlanId = userDetail && userDetail.stripeSubscribedPlanId;
        const subscriptionUpdate = stripeSubscribedPlanId ? true : false;
        console.log("subscriptionUpdate?", subscriptionUpdate);

        return (
            <StripeProvider apiKey="pk_test_pjtrb20eQPAtLomXsm4sopuW">
                < Elements >
                    <SplitForm planId={this.props.planId} subscriptionUpdate={subscriptionUpdate}
                        userDetail={userDetail}
                        goTo={this.props.goTo} user={this.props.user} fontSize={elementFontSize} />
                </Elements>
            </StripeProvider >
        );
    }
}
