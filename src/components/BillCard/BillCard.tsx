import * as React from "react";

const BillCardStyle = require("./BillCardStyle.scss");

interface BillCardProps {
    uriImage: string;
    letterColor: string;
    containterColor: string;
    footerColor: string;
    alt: string;
    buttonColor: string;
    currentPlan: string;
    featurePlan1: string;
    featurePlan2: string;
    featurePlan3: string;
    detailPlan1: string;
    detailPlan2: string;
    detailPlan3: string;
    testing: string;
    monitoring: string;
    unitTest: string;
    numVirtualDevice: string;
    numSkills: string;
    numLogs: string;
    numUsers: string;
    price: string;
    leftCard: boolean;
}

interface BillCardState {
}

export default class BillCard extends React.Component<BillCardProps, BillCardState> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={BillCardStyle.container} style={{ color: this.props.letterColor, background: this.props.containterColor }}>
                <div>
                    <div className={BillCardStyle.img_style} >
                        <img className={BillCardStyle.img_style} src={this.props.uriImage} alt={this.props.alt}
                            style={{ visibility: this.props.leftCard ? "hidden" : "visible" }} />


                        {(!this.props.leftCard) &&
                            <button className={BillCardStyle.button} style={{ backgroundColor: this.props.buttonColor }} >{this.props.alt}</button>
                        }

                        {(this.props.leftCard) &&
                            <div className={BillCardStyle.plan_row_style}><b> {this.props.currentPlan} </b><br />
                                {this.props.featurePlan1} {this.props.detailPlan1} <br />
                                {this.props.featurePlan2} {this.props.detailPlan2} <br />
                                {this.props.featurePlan3} {this.props.detailPlan3}
                            </div>
                        }

                    </div>
                </div>

                <div className={BillCardStyle.containerFooter} style={{ background: this.props.footerColor }}>
                    {this.props.leftCard ? this.props.testing : ""}
                </div>
                <div  >
                    <p className={this.props.leftCard ? BillCardStyle.left_testing_card_style : ""}>{this.props.unitTest} </p>
                    <p className={this.props.leftCard ? BillCardStyle.left_testing_card_style : ""}>{this.props.numVirtualDevice}<br />
                        {
                            this.props.leftCard ? "(Virtual Devices)" : ""
                        }
                    </p>
                </div>
                <div className={BillCardStyle.containerFooter} style={{ background: this.props.footerColor }}>
                    {this.props.leftCard ? this.props.monitoring : ""}
                </div>
                <div style={{ background: this.props.containterColor }}>
                    <p className={this.props.leftCard ? BillCardStyle.left_monitori_card_style : ""}>{this.props.numSkills} </p>
                    <p className={this.props.leftCard ? BillCardStyle.left_monitori_card_style : ""}>{this.props.numLogs}<br />
                        {
                            this.props.leftCard ? " (Events per month)" : ""
                        }
                    </p>
                    <p className={this.props.leftCard ? BillCardStyle.left_monitori_card_style : ""}>{this.props.numUsers}</p>
                </div>
                <div className={BillCardStyle.containerFooter} style={{ background: this.props.footerColor }} >
                    <b>{this.props.price}</b>
                </div>

            </div >
        );
    }
}
