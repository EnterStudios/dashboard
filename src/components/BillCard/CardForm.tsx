import { postStripe } from "../../services/sripe";

const ReactStripeElements = require("react-stripe-elements");
console.log(postStripe);

const {
    StripeProvider,
    Elements,
    CardElement,
} = ReactStripeElements;

export class CardFormC extends React.Component<any, any> {
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
            <form onSubmit={(ev) => {
                ev.preventDefault();
                this.props.stripe.createToken().then(
                    // tslint:disable-next-line:jsx-no-lambda
                    (payload: any) => {
                        // call to stripe-api
                        console.log(" then payload = ");
                        console.log(payload);
                        if (payload.id)
                            console.log(payload.id);
                        // postStripe(payload.id);
                    });
            }}>

                <StripeProvider apiKey="pk_test_pjtrb20eQPAtLomXsm4sopuW">

                    <Elements>
                        <CardElement fontSize={elementFontSize} />
                    </Elements>
                </StripeProvider>

                <button>Pay</button>
            </form >
        );
    }
}
