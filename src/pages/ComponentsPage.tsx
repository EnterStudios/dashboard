import * as React from "react";
import BillCard from "../components/BillCard/BillCard";

export default class ComponentsPage extends React.Component<any, any> {
    render() {
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
        };

        return (

            <div style={{ display: "flex", justifyContent: "center" }}>
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
                        price={sEnterprise.price} /></div>
                </div>

            </div>

        );
    }
}
