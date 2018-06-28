import * as React from "react";
import { connect } from "react-redux";
import { push, RouterAction } from "react-router-redux";
import PlanCard from "../components/BillCard/PlanCard";
import { UserDetails } from "../models/user";
import { State } from "../reducers";
import auth from "../services/auth";


interface BillPageProps {
    goTo: (uri: String) => RouterAction;
    userPlanId: string;
}


interface BillPageState {
    user: UserDetails;

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

export class PlanPage extends React.Component<BillPageProps, BillPageState> {
    constructor(props: any) {
        super(props);
        this.state = {
            user: undefined,
        };
        this.initState();
    }

    initState = async () => {
        const userDetail: UserDetails = await auth.currentUserDetails();
        this.setState({ user: userDetail });
    }

    render() {

        const userPlanId = this.state.user && this.state.user.stripeSubscribedPlanName;
        const uri = "https://bespoken.io/wp-content/uploads/2018/05/";
        const llamaPro = "Pro";
        const llamaEnterprise = "Enterprise";
        const llamaStandard = "Standard";
        const sStandard = {
            goTo: this.props.goTo,
            planId: "Standard",
            uriImage: uri + llamaStandard + ".jpg",
            letterColor: "#798a9a",
            containterColor: "#fcfdff",
            footerColor: "#e8f5fe",
            alt: llamaStandard,
            buttonColor: "#ff9934",
            currentPlan: "",
            featurePlan1: "",
            featurePlan2: "",
            featurePlan3: "",
            detailPlan3: "",
            detailPlan1: "",
            detailPlan2: "",
            leftCard: false,
            testing: "",
            monitoring: "",
            unitTest: "Free",
            numVirtualDevice: "1",
            numSkills: "3",
            numLogs: "10,000 000",
            numUsers: "2",
            price: "$25.00",
        };
        const sPro = {
            goTo: this.props.goTo,
            planId: "Pro",
            uriImage: uri + llamaPro + ".jpg",
            letterColor: "#ea8887",
            containterColor: "#fcfdff",
            footerColor: "#f2f2f2",
            alt: llamaPro,
            buttonColor: "#99d5dd",
            unitTest: "Free",
            numVirtualDevice: "2",
            numSkills: "10",
            numLogs: "Unlimited",
            numUsers: "5",
            price: "$100.00",
            currentPlan: "",
            featurePlan1: "",
            featurePlan2: "",
            featurePlan3: "",
            detailPlan3: "",
            detailPlan1: "",
            detailPlan2: "",
            leftCard: false,
            testing: "",
            monitoring: "",
        };
        const sEnterprise = {
            goTo: this.props.goTo,
            planId: "Enterprise",
            uriImage: uri + llamaEnterprise + ".jpg",
            letterColor: "#a7a491",
            containterColor: "#fdfffe",
            footerColor: "#f6f5f3",
            alt: llamaEnterprise,
            buttonColor: "#fecd33",
            unitTest: "Free",
            numVirtualDevice: "1",
            numSkills: "3",
            numLogs: "10,000 000",
            numUsers: "2",
            price: "Contact Us",
            currentPlan: "",
            featurePlan1: "",
            featurePlan2: "",
            featurePlan3: "",
            detailPlan3: "",
            detailPlan1: "",
            detailPlan2: "",
            leftCard: false,
            testing: "",
            monitoring: "",
        };

        return (

            <div style={{ display: "flex", justifyContent: "center" }}>

                <div >
                    <PlanCard
                        userPlanId={userPlanId}
                        goTo={this.props.goTo}
                        planId={sStandard.planId}
                        letterColor={sStandard.letterColor}
                        containterColor={sStandard.containterColor}
                        footerColor={sStandard.footerColor}
                        uriImage={sStandard.uriImage}
                        alt={sStandard.alt} buttonColor={sStandard.buttonColor}
                        currentPlan={"Current Plan"}
                        featurePlan1={" Plan type : "}
                        featurePlan2={""}
                        // featurePlan2={" Number of devices: "}
                        featurePlan3={"invoicing period: "}
                        detailPlan1={userPlanId}
                        detailPlan2={""}
                        detailPlan3={"monthly"}
                        testing={"Testing"}
                        unitTest={"Unit testing"}
                        numVirtualDevice={"End-to-end Testing"}
                        monitoring={"Monitoring"}
                        numSkills={"Skills"}
                        numLogs={"Logs"}
                        numUsers={"Users"}
                        price={"Montlhy price"}
                        leftCard={true}
                    />
                </div>

                <div ><PlanCard
                    userPlanId={userPlanId}
                    goTo={this.props.goTo}
                    planId={sStandard.planId}
                    letterColor={sStandard.letterColor}
                    containterColor={sStandard.containterColor}
                    footerColor={sStandard.footerColor}
                    uriImage={sStandard.uriImage}
                    alt={sStandard.alt} buttonColor={sStandard.buttonColor}
                    unitTest={sStandard.unitTest}
                    numVirtualDevice={sStandard.numVirtualDevice}
                    numSkills={sStandard.numSkills}
                    numLogs={sStandard.numLogs}
                    numUsers={sStandard.numUsers}
                    price={sStandard.price}
                    currentPlan={sStandard.currentPlan}
                    featurePlan1={sStandard.featurePlan1}
                    featurePlan2={sStandard.featurePlan2}
                    featurePlan3={sStandard.featurePlan3}
                    detailPlan3={sStandard.detailPlan3}
                    detailPlan1={sStandard.detailPlan1}
                    detailPlan2={sStandard.detailPlan2}
                    testing={sStandard.testing}
                    monitoring={sStandard.monitoring}
                    leftCard={sStandard.leftCard}
                /></div>
                <div ><PlanCard
                    userPlanId={userPlanId}
                    goTo={this.props.goTo}
                    planId={sPro.planId}
                    letterColor={sPro.letterColor}
                    containterColor={sPro.containterColor}
                    footerColor={sPro.footerColor}
                    uriImage={sPro.uriImage}
                    alt={sPro.alt}
                    buttonColor={sPro.buttonColor}
                    unitTest={sPro.unitTest}
                    numVirtualDevice={sPro.numVirtualDevice}
                    numSkills={sPro.numSkills}
                    numLogs={sPro.numLogs}
                    numUsers={sPro.numUsers}
                    price={sPro.price}
                    currentPlan={sPro.currentPlan}
                    featurePlan1={sPro.featurePlan1}
                    featurePlan2={sPro.featurePlan2}
                    featurePlan3={sPro.featurePlan3}
                    detailPlan3={sPro.detailPlan3}
                    detailPlan1={sPro.detailPlan1}
                    detailPlan2={sPro.detailPlan2}
                    testing={sPro.testing}
                    monitoring={sPro.monitoring}
                    leftCard={sPro.leftCard}
                /></div >

                <div ><PlanCard
                    userPlanId={userPlanId}
                    goTo={this.props.goTo}
                    planId={sEnterprise.planId}
                    letterColor={sEnterprise.letterColor}
                    containterColor={sEnterprise.containterColor}
                    footerColor={sEnterprise.footerColor}
                    uriImage={sEnterprise.uriImage}
                    alt={sEnterprise.alt} buttonColor={sEnterprise.buttonColor}
                    unitTest={sEnterprise.unitTest}
                    numVirtualDevice={sEnterprise.numVirtualDevice}
                    numSkills={sEnterprise.numSkills}
                    numLogs={sEnterprise.numLogs}
                    numUsers={sEnterprise.numUsers}
                    price={sEnterprise.price}
                    currentPlan={sEnterprise.currentPlan}
                    featurePlan1={sEnterprise.featurePlan1}
                    featurePlan2={sEnterprise.featurePlan2}
                    featurePlan3={sStandard.featurePlan3}
                    detailPlan3={sStandard.detailPlan3}
                    detailPlan1={sEnterprise.detailPlan1}
                    detailPlan2={sEnterprise.detailPlan2}
                    testing={sEnterprise.testing}
                    monitoring={sEnterprise.monitoring}
                    leftCard={sEnterprise.leftCard}
                /></div>

            </div>
        );
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PlanPage);
