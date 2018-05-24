const ReactStripeElements = require("react-stripe-elements");

const {
    StripeProvider,
    Elements,
    injectStripe,
    CardNumberElement,
    CardExpiryElement,
    CardCVCElement,
    PostalCodeElement,
} = ReactStripeElements;
const handleBlur = () => {
    console.log("[blur]");
};
const handleChange = (change: any) => {
    console.log("[change]", change);
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

class SplitFormC extends React.Component<any & { fontSize: string }, any> {
    handleSubmit = (ev: any) => {
        ev.preventDefault();
        if (this.props.stripe) {
            this.props.stripe
                .createToken()
                .then((payload: any) => {
                    console.log("[token]", payload);
                    // call to stripe-api
                });
        } else {
            console.log("Stripe.js hasnt loaded yet.");
        }
    }
    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Card number
            <CardNumberElement
                        onBlur={handleBlur}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)}
                    />
                </label>
                <label>
                    Expiration date
            <CardExpiryElement
                        onBlur={handleBlur}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)}
                    />
                </label>
                <label>
                    CVC
            <CardCVCElement
                        onBlur={handleBlur}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)}
                    />
                </label>
                <label>
                    Postal code
            <PostalCodeElement
                        onBlur={handleBlur}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)}
                    />
                </label>
                <button>Pay</button>
            </form>
        );
    }
}
const SplitForm = injectStripe(SplitFormC);

export class PaymentForm extends React.Component<any, any> {
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

    componentDidMount() {
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
                <div className="Checkout">
                    <b>Payment form</b>
                    <Elements>
                        <SplitForm fontSize={elementFontSize} />
                    </Elements>
                </div>
            </StripeProvider>
        );
    }
}