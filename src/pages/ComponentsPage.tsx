import * as React from "react";
import RadialBarChart from "../components/Graphs/Radial/ValidationRadialChart";

const centerStyle = {
    margin: "auto",
    width: "50%",
    padding: "10px"
};

export default class ComponentsPage extends React.Component<any, any> {
    render() {
        return (
            <div>
                <h1 style={{ ...centerStyle, ...{ textAlign: "center" } }}>Components Page</h1>
                <div style={{padding: 20}}>
                    <div style={{display: "inline-block", height: 300}}><RadialBarChart successRatio={100} /></div>
                    <div style={{display: "inline-block", height: 300}}><RadialBarChart successRatio={80} color={"#FF0000"} /></div>
                    <div style={{display: "inline-block", height: 300}}><RadialBarChart successRatio={20} color={"#000"} /></div>
                </div>
            </div>
        );
    }
}
