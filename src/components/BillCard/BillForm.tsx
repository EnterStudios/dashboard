import * as React from "react";
const BillCardStyle = require("./BillCardStyle.scss");

interface BillFormProps {
    uriImageLLamaPay: string;
    uriImageLLamalogo: string;
    date: string;
    currentPlan: string;
    planToSubscribe: string;
    altLlamaPay: string;
    altLlamaLogo: string;
    backgoundColor: string;
    price: string;
}

interface BillFormState {
}

export default class BillForm extends React.Component<BillFormProps, BillFormState> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={BillCardStyle.container}>

                <img src={this.props.uriImageLLamalogo} alt={this.props.altLlamaLogo} />

                <div  >
                    <p>Updates plan to:<br />
                        <strong>    {this.props.planToSubscribe} </strong>
                        <br />
                        ______________________
                    </p>

                    <p>Date:<br />
                        <strong> {this.props.date} </strong>
                        <br />
                        ______________________
                     </p>

                </div>
                <div >
                    <img src={this.props.uriImageLLamaPay} alt={this.props.altLlamaPay} />
                </div>
            </div >
        );
    }
}
