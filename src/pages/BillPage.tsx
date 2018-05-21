import * as moment from "moment";
import * as React from "react";
import BillCard from "../components/BillCard/BillCard";
import Source from "../models/source";
import service from "../services/source";


export default class BillPage extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.handleGetStarted = this.handleGetStarted.bind(this);
    }

    async handleGetStarted() {
        if (this.props.source && this.props.source.id) {
            this.props.goTo("/skills/" + this.props.source.id + "/integration");
        } else {
            this.props.handleLoadingChange(true);
            const source: Source = new Source({ name: "default1", created: moment().toISOString() });
            const createdSource = await service.createSource(source);
            await this.props.getSources();
            this.props.handleLoadingChange(false);
            this.props.goTo(`/skills/${createdSource.id}/`);
        }
    }

    render() {
        const uri = "https://bespoken.io/wp-content/uploads/2018/05/";
        const llamaStandard = "llama-standard";
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

        return (

            <div style={{ width: 367, height: 700 }}>
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
        );
    }
};

