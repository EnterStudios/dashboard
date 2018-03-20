import * as React from "react";
// TODO: this is using require in order to avoid creating several definitions on typescript for recharts
const { Legend, RadialBarChart, RadialBar } = require("recharts");

const RadialChartStyle = require("./ValidationRadialChartStyle.scss");

interface ValidationRadialChartProps {
    successRatio: number;
    color?: string;
    small?: boolean;
}

interface ValidationRadialChartState {
}

class ValidationRadialChart extends React.Component<ValidationRadialChartProps, ValidationRadialChartState> {

    render() {
        const data = [
            {name: this.props.successRatio, value: 1, fill: this.props.color || "#99d5dc"},
        ];
        const renderLegend = (props: any) => {
            const { payload } = props;

            return (
                <ul className={`${RadialChartStyle.container} ${this.props.small ? RadialChartStyle.small : ""}`}>
                    {
                        payload.map((entry: any, index: any) => (
                            <li key={`item-${index}`}>
                                <span>{entry.value}%</span>
                                <span>{this.props.small ? "success" : "of items has passed validation"}</span>
                            </li>
                        ))
                    }
                </ul>
            );
        };
        return (
            <RadialBarChart width={this.props.small ? 200 : 300} height={300} innerRadius="10%" outerRadius="80%" data={data} startAngle={180} endAngle={0}>
                <RadialBar minAngle={0} maxAngle={(this.props.successRatio * 180 / 100)} label={false} background={true} clockWise={true} dataKey="value"/>
                <Legend iconSize={10} width={this.props.small ? 200 : 300} height={100} layout="horizontal" verticalAlign="middle" align="center" content={renderLegend} />
            </RadialBarChart>
        );
    }
}

export default ValidationRadialChart;
