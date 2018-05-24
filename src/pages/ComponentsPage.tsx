import * as React from "react";
import BillCard from "../components/BillCard/BillCard";
import { CardFormC } from "../components/BillCard/CardForm";
import { PaymentForm } from "../components/BillCard/payment";
import BarsChart from "../components/Graphs/Bar/BarsChart";
import RadialBarChart from "../components/Graphs/Radial/ValidationRadialChart";
const ReactStripeElements = require("react-stripe-elements");

const {
    StripeProvider,
    Elements,
} = ReactStripeElements;


const centerStyle = {
    margin: "auto",
    width: "50%",
    padding: "10px"
};
export default class ComponentsPage extends React.Component<any, any> {
    render() {

        const data = [
            { name: "Page A", uv: 4000 },
            { name: "Page B", uv: 3000 },
            { name: "Page C", uv: 2000 },
            { name: "Page D", uv: 2780 },
            { name: "Page E", uv: 1890 },
            { name: "Page F", uv: 2390 },
            { name: "Page G", uv: 3490 },
            { name: "Page A", uv: 4000 },
            { name: "Page B", uv: 3000 },
            { name: "Page C", uv: 2000 },
            { name: "Page D", uv: 2780 },
            { name: "Page E", uv: 1890 },
            { name: "Page F", uv: 2390 },
            { name: "Page G", uv: 3490 },
            { name: "Page A", uv: 4000 },
            { name: "Page B", uv: 3000 },
            { name: "Page C", uv: 2000 },
            { name: "Page D", uv: 2780 },
            { name: "Page E", uv: 1890 },
            { name: "Page F", uv: 2390 },
            { name: "Page G", uv: 3490 },
            { name: "Page A", uv: 4000 },
            { name: "Page B", uv: 3000 },
            { name: "Page C", uv: 2000 },
            { name: "Page D", uv: 2780 },
            { name: "Page E", uv: 1890 },
            { name: "Page F", uv: 2390 },
            { name: "Page G", uv: 3490 },
            { name: "Page A", uv: 4000 },
            { name: "Page B", uv: 3000 },
            { name: "Page C", uv: 2000 },
            { name: "Page D", uv: 2780 },
            { name: "Page E", uv: 1890 },
            { name: "Page F", uv: 2390 },
            { name: "Page G", uv: 3490 },
        ];

        const uri = "https://bespoken.io/wp-content/uploads/2018/05/";
        const llamaPro = "Pro";
        const llamaEnterprise = "Enterprise";
        const llamaStandard = "Standard";
        const sStandard = {
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
            <div>
                <div>
                    <h1 style={{ ...centerStyle, ...{ textAlign: "center" } }}>Components Page</h1>
                    <div className="components_container">
                        <div><RadialBarChart successRatio={100} /></div>
                        <div><RadialBarChart successRatio={80} color={"#FF0000"} /></div>
                        <div><RadialBarChart successRatio={20} color={"#000"} /></div>

                    </div>

                    <div style={{ height: 250 }}><BarsChart data={data} bars={[{ dataKey: "uv", title: "Daily Events", average: 879 }]} /></div>
                </div>
                <div style={{ maxWidth: 300, height: 100, padding: 30 }}>
                    <b>Payment form 1</b>
                    <StripeProvider apiKey="pk_test_pjtrb20eQPAtLomXsm4sopuW">

                        <Elements>
                            <CardFormC />
                        </Elements>
                    </StripeProvider>
                </div>
                <div style={{ padding: 30 }}>
                    <PaymentForm />
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ width: 232, height: 700 }}>
                        <div ><BillCard letterColor={sStandard.letterColor}
                            containterColor={sStandard.containterColor}
                            footerColor={sStandard.footerColor}
                            uriImage={sStandard.uriImage}
                            alt={sStandard.alt} buttonColor={sStandard.buttonColor}
                            currentPlan={"Current Plan"}
                            featurePlan1={" Plan type : "}
                            featurePlan2={" Number of devices: "}
                            featurePlan3={"invoicing period: "}
                            detailPlan3={"monthly"}
                            detailPlan1={"Free"}
                            detailPlan2={"1"}
                            testing={"Testing"}
                            unitTest={"Unit testing"}
                            numVirtualDevice={"End-to-end Testing"}
                            monitoring={"Monitoring"}
                            numSkills={"Skills"}
                            numLogs={"Logs"}
                            numUsers={"Users"}
                            price={"Montlhy price"}
                            leftCard={true}

                        /></div>
                    </div>
                    <div style={{ width: 232, height: 700 }}>
                        <div ><BillCard letterColor={sStandard.letterColor}
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
                    </div>
                    <div style={{ width: 232 }}>
                        <div ><BillCard letterColor={sPro.letterColor}
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
                    </div>
                    <div style={{ width: 232 }}>
                        <div ><BillCard letterColor={sEnterprise.letterColor}
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

                </div>
            </div>
        );
    }
}
