import * as React from "react";

let InjectedProps: any = require("react-stripe-elements").inject;
console.log(InjectedProps);
// type injectType = { InjectedProps };
let stripe: any = require("react-stripe-elements");

const {
    CardElement,
    CardNumberElement,
    CardExpiryElement,
    CardCVCElement,
    PostalCodeElement,
    PaymentRequestButtonElement,

    Elements,
    injectStripe,
} = stripe;

console.log("stripe");
console.log(stripe);

const handlerBlur = () => {
    console.log("[blur]");
};

const handlerChange = (change: any) => {
    console.log("[Change]", change);
};

const handleClick = () => {
    console.log("[click]");
};

const handleFocus = () => {
    console.log("[focus]");
};

const handleReady = () => {
    console.log("[ready]");
};

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


class CardFomC extends React.Component<any & { fontSize: string }, any>{
    handleSubmit = (ev: any) => {
        ev.preventDefault();
        if (this.props.stripe) {
            this.props.stripe.createToken().then(
                (payload: any) => console.log("[token]", payload)
            )
        } else {
            console.log("stripe.js hasnt loaded yet");
        }
    };
    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Card detail
                    <CardElement
                        onBlur={handlerBlur}
                        onChange={handlerChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)}
                    />

                </label>
                <button>Pay</button>

            </form>
        );
    };


}

const CardForm = injectStripe(CardFomC);

class SplitFormC extends React.Component<any & { fontSize: string }, any>{
    handleSubmit = (ev: any) => {
        ev.preventDefault();
        if (this.props.stripe) {
            this.props.stripe.createToken().then(
                (payload: any) => {
                    console.log("[token]", payload)
                }

            );
        } else {
            console.log("stripe.js hasnt loaded yet");
        }
    };
    render() {
        return (
            < form onSubmit={this.handleSubmit} >

                <label>
                    Card CardNumberElement
                <CardNumberElement
                        onBlur={handlerBlur}
                        onChange={handlerChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)} />
                </label>
                <label>
                    Expiration date
                    <CardExpiryElement
                        onBlur={handlerBlur}
                        onChange={handlerChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)}
                    />
                </label>
                <label>
                    CVC
          <CardCVCElement
                        onBlur={handlerBlur}
                        onChange={handlerChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)}
                    />
                </label>
                <label>
                    Postal code
          <PostalCodeElement
                        onBlur={handlerBlur}
                        onChange={handlerChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)}
                    />
                </label>
                <button>Pay</button>
            </form >
        );
    }
}


const SplitForm = injectStripe(SplitFormC);

class PaymentRequestFormC extends React.Component<
    any,
    {
        canMakePayment: boolean,
        paymentRequest: Object,
    }
    > {
    constructor(props: any) {
        super(props);

        const paymentRequest = props.stripe.paymentRequest({
            country: "US",
            currency: "usd",
            total: {
                label: "Demo total",
                amount: 1000,
            },
        });

        paymentRequest.on("token", (data: any) => {
            console.log("Received Stripe token: ", data);
            console.log("Received customer information: ", data);
            // complete("success");
        });

        paymentRequest.canMakePayment().then(
            (result: any) => {
                console.log("paymentRequest.canMakePayment: result : ", result);
                //this.setState({ canMakePayment: !!result });
            });

        this.state = {
            canMakePayment: false,
            paymentRequest,
        };
    }

    state: {
        canMakePayment: boolean,
        paymentRequest: Object,
    };

    render() {
        return this.state.canMakePayment ? (
            <PaymentRequestButtonElement
                className="PaymentRequestButton"
                onBlur={handlerBlur}
                onClick={handleClick}
                onFocus={handleFocus}
                onReady={handleReady}
                paymentRequest={this.state.paymentRequest}
                style={{
                    paymentRequestButton: {
                        theme: "dark",
                        height: "64px",
                        type: "donate",
                    },
                }}
            />
        ) : null;
    }
}
const PaymentRequestForm = injectStripe(PaymentRequestFormC);
export class CheckoutC extends React.Component<{}, { elementFontSize: string }> {
    constructor() {
        super();
        this.state = {
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

    render() {
        const { elementFontSize } = this.state;
        return (
            <div className="Checkout">
                <h1>Available Elements</h1>
                <Elements>
                    <CardForm fontSize={elementFontSize} />
                </Elements>
                <Elements>
                    <SplitForm fontSize={elementFontSize} />
                </Elements>
                <Elements>
                    <PaymentRequestForm />
                </Elements>
            </div>
        );
    }
}