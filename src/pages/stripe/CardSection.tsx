import * as React from "react";

const CardElement = require("react-stripe-elements").CardElement;

class CardSection extends React.Component<any, any> {
    render() {
        return (
            <label>
                Card details
        <CardElement style={{ base: { fontSize: "18px" } }} />
            </label>
        );
    }
};

export default CardSection;