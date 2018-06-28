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
    user: User;
    planId: string;
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

    handleSubmit = (ev: any) => {
        ev.preventDefault();

        if (this.props.stripe) {
            this.props.stripe
                .createToken()
                .then(async (payload: any) => {

                    if (payload.token) {
                        const userDetail: UserDetails = await auth.currentUserDetails();
                        const userProperties: UserProperties = {
                            email: this.props.user.email,
                            userId: this.props.user.userId,
                            stripeCustomerObjId: userDetail.stripeCustomerObjId ?
                                userDetail.stripeCustomerObjId : undefined,
                            stripeSubscribedPlanId: userDetail.stripeSubscribedPlanId ?
                                userDetail.stripeSubscribedPlanId : undefined,
                        };
                        const user = new User(userProperties);
                        const planToSubscribe = this.props.planId;
                        const helper = await postStripe(user, payload.token.id, planToSubscribe);
                        this.setState({
                            message: helper
                        });
                        if (helper === "operation success") {

                            setTimeout(() => {
                                this.redirect();
                            }, 2500);
                        }

                    } else {
                        console.error("fail to try to create a token ", payload);
                        this.setState({
                            message: payload.error.message
                        });
                    }
                });
        } else {
            this.setState({
                message: "Stripe.js hasnt loaded yet."
            });
            console.error("Stripe.js hasnt loaded yet.");
        }
    }
    render() {
        const { message } = this.state;
        return (
            <form onSubmit={this.handleSubmit}>
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
                <button>{"Subscribe"}</button>
                <div><label className={PaymentStyle.invalid}> <b> {message}</b></label></div>
            </form>
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
    }

    render() {
        const { elementFontSize } = this.state;
        return (
            <StripeProvider apiKey="pk_test_pjtrb20eQPAtLomXsm4sopuW">
                {/* <div  className="Checkout"> */}
                <div className={PaymentStyle.container}>
                    <div>
                        <img src="https://bespoken.io/wp-content/uploads/2018/05/voicexplogo-e1526593815539.png"
                            alt="security logo" />
                        <img src="https://bespoken.io/wp-content/uploads/2018/05/voicexplogo-e1526593815539.png"
                            alt="security logo" />
                    </div>
                    <div>
                        <img src="https://bespoken.io/wp-content/uploads/2018/05/voicexplogo-e1526593815539.png"
                            alt="security logo" />
                        <img src="https://bespoken.io/wp-content/uploads/2018/05/voicexplogo-e1526593815539.png"
                            alt="security logo" />
                    </div>
                    <b>Payment form </b>
                    < Elements>
                        <SplitForm planId={this.props.planId} goTo={this.props.goTo} user={this.props.user} fontSize={elementFontSize} />
                    </Elements>
                </div >
            </StripeProvider >
        );
    }
}
