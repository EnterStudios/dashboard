import * as React from "react";
const Elements = require("react-stripe-elements").elements;

// import InjectedCheckoutForm from "./CheckoutForm";

class MyStoreCheckout extends React.Component<any, any> {
    render() {
        return (
            <Elements>
                {/* <InjectedCheckoutForm /> */}
            </Elements>
        );
    }
}

export default MyStoreCheckout;