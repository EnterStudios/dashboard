import * as React from "react";
import { Cell, Grid } from "./Grid";

import { Dimensions, Measure } from "./Measure";

export interface TwoPaneProps {
    spacing: boolean;
    leftStyle?: React.CSSProperties;
    rightStyle?: React.CSSProperties;
    gridClass?: string;
}

interface TwoPaneState {
    myHeight: number;
}

/**
 * A widget that splits two children in half and keeps their sizes stable to the size of this widget. That means that
 * the children will be responsible for their scrolling should the become larger than this widget.
 */
export class TwoPane extends React.Component<TwoPaneProps, TwoPaneState> {

    constructor(props: TwoPaneProps) {
        super(props);
        this.state = {
            myHeight: 0
        };

        this.onMeasure = this.onMeasure.bind(this);
    }

    onMeasure(dimensions: Dimensions) {
        this.state.myHeight = dimensions.height;
        this.setState(this.state);
    }

    render(): JSX.Element {
        let leftStyleProp = (this.props.leftStyle) ? this.props.leftStyle : {};
        let rightStyleProp = (this.props.rightStyle) ? this.props.rightStyle : {};
        let spacing = this.props.spacing !== undefined && this.props.spacing;

        let leftStyle = {...{ height: this.state.myHeight, overflowY: "auto" }, ...leftStyleProp };
        let rightStyle = {...{height: this.state.myHeight, overflowY: "auto" }, ...rightStyleProp };

        let leftObj = (this.props as any).children[0];
        let rightObj = (this.props as any).children[1];

        return (
            <Measure
                onMeasure={this.onMeasure} >
                <Grid
                    className={this.props.gridClass}
                    noSpacing={spacing}>
                    <Cell col={6} phone={4} tablet={4} style={leftStyle}>
                        {leftObj}
                    </Cell>
                    <Cell col={6} hidePhone={true} tablet={4} style={rightStyle}>
                        {rightObj}
                    </Cell>
                </Grid >
            </Measure>
        );
    }
}

export default TwoPane;
