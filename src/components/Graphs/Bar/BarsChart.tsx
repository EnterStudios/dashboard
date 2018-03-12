import * as React from "react";

const { Bar, BarChart, Legend, ResponsiveContainer } = require("recharts");

const BarsChartStyle = require("./BarsChartStyle.scss");

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
                <ul className={BarsChartStyle.container}>
                    {
                        payload.map((entry: any, index: any) => (
                            <li className={BarsChartStyle.item} key={`item-${index}`}>
                                <span>{entry.payload.title}</span>
                                {entry.payload.subtitle && <span>{entry.payload.subtitle}</span>}
                                <span className={`${BarsChartStyle.number} ${entry.payload.subtitle ? BarsChartStyle.subtitle_margin : ""}`}>{entry.payload.average}</span>
                            </li>
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
                    <Legend content={renderLegend} verticalAlign={"top"} align={"center"} />
                </BarChart>
            </ResponsiveContainer>
        );
    }
}

export default BarsChart;
