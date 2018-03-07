import * as React from "react";

const { Bar, BarChart, Legend, ResponsiveContainer } = require("recharts");

interface BarsChartProps {
    data: any[];
    bars?: any[];
}

interface BarsChartState {
}

class BarsChart extends React.Component<BarsChartProps, BarsChartState> {

    static defaultProps: BarsChartProps = {
        data: [],
        bars: [],
    };

    static createBars(props: BarsChartProps): JSX.Element[] {
        const bars: JSX.Element[] = [];
        let i = 0;
        for (const bar of props.bars) {
            const prop = { fill: "#99d5dc", ...bar};
            bars.push(<Bar key={i++} {...prop} />);
        }
        return bars;
    }

    render() {
        const renderLegend = (props: any) => {
            const { payload } = props;

            return (
                <ul>
                    {
                        payload.map((entry: any, index: any) => (
                            <li key={`item-${index}`}>{entry.value}</li>
                        ))
                    }
                </ul>
            );
        };
        return (
            <ResponsiveContainer>
                <BarChart width={300} height={300} data={this.props.data}>
                    {
                        BarsChart.createBars(this.props)
                    }
                    <Legend content={renderLegend} />
                </BarChart>
            </ResponsiveContainer>
        );
    }
}

export default BarsChart;
