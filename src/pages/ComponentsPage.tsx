import * as React from "react";
import BarsChart from "../components/Graphs/Bar/BarsChart";
import RadialBarChart from "../components/Graphs/Radial/ValidationRadialChart";

const centerStyle = {
    margin: "auto",
    width: "50%",
    padding: "10px"
};

export default class ComponentsPage extends React.Component<any, any> {
    render() {
        const data = [
            {name: "Page A", uv: 4000},
            {name: "Page B", uv: 3000},
            {name: "Page C", uv: 2000},
            {name: "Page D", uv: 2780},
            {name: "Page E", uv: 1890},
            {name: "Page F", uv: 2390},
            {name: "Page G", uv: 3490},
            {name: "Page A", uv: 4000},
            {name: "Page B", uv: 3000},
            {name: "Page C", uv: 2000},
            {name: "Page D", uv: 2780},
            {name: "Page E", uv: 1890},
            {name: "Page F", uv: 2390},
            {name: "Page G", uv: 3490},
            {name: "Page A", uv: 4000},
            {name: "Page B", uv: 3000},
            {name: "Page C", uv: 2000},
            {name: "Page D", uv: 2780},
            {name: "Page E", uv: 1890},
            {name: "Page F", uv: 2390},
            {name: "Page G", uv: 3490},
            {name: "Page A", uv: 4000},
            {name: "Page B", uv: 3000},
            {name: "Page C", uv: 2000},
            {name: "Page D", uv: 2780},
            {name: "Page E", uv: 1890},
            {name: "Page F", uv: 2390},
            {name: "Page G", uv: 3490},
            {name: "Page A", uv: 4000},
            {name: "Page B", uv: 3000},
            {name: "Page C", uv: 2000},
            {name: "Page D", uv: 2780},
            {name: "Page E", uv: 1890},
            {name: "Page F", uv: 2390},
            {name: "Page G", uv: 3490},
        ];
        return (
            <div>
                <h1 style={{ ...centerStyle, ...{ textAlign: "center" } }}>Components Page</h1>
                <div className="components_container">
                    <div><RadialBarChart successRatio={100} /></div>
                    <div><RadialBarChart successRatio={80} color={"#FF0000"} /></div>
                    <div><RadialBarChart successRatio={20} color={"#000"} /></div>
                </div>
                <div className="components_container">
                    <div style={{height: 250}}><BarsChart data={data} bars={[{dataKey: "uv", title: "Daily Events", average: 879}]} /></div>
                </div>
            </div>
        );
    }
}
