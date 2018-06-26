import * as React from "react";
import { connect } from "react-redux";
import { push, RouterAction } from "react-router-redux";
import BillForm from "../components/BillCard/BillForm";
import PaymentForm from "../components/BillCard/Payment";
import { State } from "../reducers";

const PaymentStyle = require("../components/BillCard/PaymentStyle.scss");



interface BillPageProps {
    goTo: (uri: String) => RouterAction;
}

interface BillPageState {
};

function mapStateToProps(state: State.All) {
    return {
    };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>) {
    return {
        goTo: function (uri: string): RouterAction {
            return dispatch(push(uri));
        },
    };
}

export class BillPage extends React.Component<BillPageProps, BillPageState> {
    constructor(props: any) {
        super(props);

    }

    render() {
        const uri = "https://bespoken.io/wp-content/uploads/2018/06/";
        const llama = "llama-pay";
        const llamaLogo = "Bespoken-Logo-Web-White";
        const sStandard = {
            uriImageLLamaPay: uri + llama + ".png",
            uriImageLLamalogo: uri + llamaLogo + ".png",
            date: "june 18th, 2018",
            currentPlan: "pro",
            planToSubscribe: "standard",
            altLlamaPay: "llama pay",
            altLlamaLogo: "logo",
            backgoundColor: "#99d5dc",
            price: "$25.00",
        };

        return (
            <div style={{
                "display": "flex",
                "justifyContent": "center",
                "width": "100%",
                "height": "600px",
            }} >
                <div className={PaymentStyle.cardContainer}
                >

                    <BillForm uriImageLLamaPay={sStandard.uriImageLLamaPay}
                        uriImageLLamalogo={sStandard.uriImageLLamalogo}
                        date={sStandard.date}
                        currentPlan={sStandard.currentPlan}
                        planToSubscribe={sStandard.planToSubscribe}
                        altLlamaPay={sStandard.altLlamaPay}
                        altLlamaLogo={sStandard.altLlamaLogo}
                        backgoundColor={sStandard.backgoundColor}
                        price={sStandard.price}
                    />
                    <PaymentForm />
                </div>
            </div>
        );
    }
};
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BillPage);
