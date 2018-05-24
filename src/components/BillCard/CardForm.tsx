const ReactStripeElements = require("react-stripe-elements");

const {
    CardElement,
} = ReactStripeElements;

export class CardFormC extends React.Component<any, any> {

    render() {
        return (
            // tslint:disable-next-line:jsx-no-lambda
            <form onSubmit={(ev) => {
                ev.preventDefault();
                this.props.stripe.createToken().then(
                    // tslint:disable-next-line:jsx-no-lambda
                    (payload: any) => {
                        // call to stripe-api
                        console.log(" then payload = ");
                        console.log(payload);
                    });
            }}>
                <CardElement />
                <button>Pay</button>
            </form >
        );
    }
}
