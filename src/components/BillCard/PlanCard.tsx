import * as React from "react";
import { RouterAction } from "react-router-redux";

const PlanCardStyle = require("./PlanCardStyle.scss");

interface BillCardProps {
    userPlanId: string;
    planId: string;
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
    goTo: (uri: String) => RouterAction;
}

interface BillCardState {
    //    user: UserDetails;
}

export default class PlanCard extends React.Component<BillCardProps, BillCardState> {
    constructor(props: any) {
        super(props);
    }

    handlePlanClick = async (evt: any) => {
        if (this.props.goTo) {

            this.props.goTo("/bills/" + this.props.planId);


        }
    }

    render() {
        const selected = (this.props.planId === this.props.userPlanId) ? PlanCardStyle.selected : "";

        console.log(this.props.userPlanId, (this.props.planId === this.props.userPlanId));
        return (
            <div className={PlanCardStyle.container} style={{ color: this.props.letterColor, background: this.props.containterColor }}>
                <div>
                    <div className={PlanCardStyle.img_style} >
                        <img className={PlanCardStyle.img_style} src={this.props.uriImage} alt={this.props.alt}
                            style={{ visibility: this.props.leftCard ? "hidden" : "visible" }} />


                        {(!this.props.leftCard) &&
                            <button disabled={this.props.planId === this.props.userPlanId} onClick={this.handlePlanClick} className={`${PlanCardStyle.button} ${selected}`} style={{ backgroundColor: this.props.buttonColor }} >{this.props.alt}</button>
                        }

                        {(this.props.leftCard) &&
                            <div className={PlanCardStyle.plan_row_style}><b> {this.props.currentPlan} </b><br />
                                {this.props.featurePlan1} {this.props.detailPlan1} <br />
                                {/* {this.props.featurePlan2} {this.props.detailPlan2} <br /> */}
                                {this.props.featurePlan3} {this.props.detailPlan3}
                            </div>
                        }

                    </div>
                </div>

                <div className={PlanCardStyle.containerFooter} style={{ background: this.props.footerColor }}>
                    {this.props.leftCard ? this.props.testing : ""}
                </div>
                <div  >
                    <p className={this.props.leftCard ? PlanCardStyle.left_testing_card_style : ""}>{this.props.unitTest} </p>
                    <p className={this.props.leftCard ? PlanCardStyle.left_testing_card_style : ""}>{this.props.numVirtualDevice}<br />
                        {
                            this.props.leftCard ? "(Virtual Devices)" : ""
                        }
                    </p>
                </div>
                <div className={PlanCardStyle.containerFooter} style={{ background: this.props.footerColor }}>
                    {this.props.leftCard ? this.props.monitoring : ""}
                </div>
                <div style={{ background: this.props.containterColor }}>
                    <p className={this.props.leftCard ? PlanCardStyle.left_monitori_card_style : ""}>{this.props.numSkills} </p>
                    <p className={this.props.leftCard ? PlanCardStyle.left_monitori_card_style : ""}>{this.props.numLogs}<br />
                        {
                            this.props.leftCard ? " (Events per month)" : ""
                        }
                    </p>
                    <p className={this.props.leftCard ? PlanCardStyle.left_monitori_card_style : ""}>{this.props.numUsers}</p>
                </div>
                <div className={PlanCardStyle.containerFooter} style={{ background: this.props.footerColor }} >
                    <b>{this.props.price}</b>
                </div>

            </div >
        );
    }
}
