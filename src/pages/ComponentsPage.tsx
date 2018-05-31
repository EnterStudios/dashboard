import * as React from "react";
import AceEditor from "react-ace";
import { PaymentForm } from "../components/BillCard/Payment";
import PlanCard from "../components/BillCard/PlanCard";
import BarsChart from "../components/Graphs/Bar/BarsChart";
import RadialBarChart from "../components/Graphs/Radial/ValidationRadialChart";
import SourceService from "../services/source";

import "brace/mode/html";
import "brace/theme/monokai";

const centerStyle = {
    margin: "auto",
    width: "50%",
    padding: "10px"
};
export default class ComponentsPage extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            bannerHtml: "",
            script: "",
        };
    }

    async componentDidMount() {
        const banner = await SourceService.getBanner("communication");
        this.setState(prevState => ({
            ...prevState,
            bannerHtml: banner.htmlstring,
            script: banner.script
        }));
        if (banner.script) {
            this.runScript(banner.script);
        }
    }

    runScript = (script: string) => {
        const scriptTag = document.createElement("script");
        scriptTag.async = true;
        scriptTag.innerHTML = script;
        document.body.appendChild(scriptTag);
    }

    handleBannerHtmlChange = (value: string) => {
        this.setState(() => ({
            bannerHtml: value,
        }));
        if (this.state.script) {
            this.runScript(this.state.script);
        }
    }

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
                <h1 style={{ ...centerStyle, ...{ textAlign: "center" } }}>Components Page</h1>
                <div style={{ minHeight: 830 }}>
                    <h2 style={{ paddingLeft: 20 }}>Login right panel</h2>
                    <div className={"global_login_container"}>
                        <div style={{ paddingTop: 0, textAlign: "center" }}>
                            <AceEditor
                                style={{ width: "90%", height: "90%", margin: "auto" }}
                                mode="html"
                                theme="monokai"
                                name="yamlEditor"
                                onChange={this.handleBannerHtmlChange}
                                fontSize={14}
                                showPrintMargin={false}
                                showGutter={true}
                                highlightActiveLine={true}
                                value={this.state.bannerHtml}
                                wrapEnabled={true} />
                        </div>
                        <div className={"banner_test"} dangerouslySetInnerHTML={{ __html: this.state.bannerHtml }} />
                    </div>
                </div>
                <div>
                    <div className="components_container">
                        <h2>Radial chart</h2>
                        <div><RadialBarChart successRatio={100} /></div>
                        <div><RadialBarChart successRatio={80} color={"#FF0000"} /></div>
                        <div><RadialBarChart successRatio={20} color={"#000"} /></div>

                    </div>

                    <div className="components_container" style={{ height: 250, marginBottom: 50 }}>
                        <h2 style={{ margin: 0 }}>Bars chart</h2>
                        <BarsChart data={data} bars={[{ dataKey: "uv", title: "Daily Events", average: 879 }]} />
                    </div>
                </div>

                <div style={{ padding: 30 }}>
                    <PaymentForm user={undefined} />
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ width: 232, height: 700 }}>
                        <div ><PlanCard letterColor={sStandard.letterColor}
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
                        <div ><PlanCard letterColor={sStandard.letterColor}
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
                        <div ><PlanCard letterColor={sPro.letterColor}
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
                        <div ><PlanCard letterColor={sEnterprise.letterColor}
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
