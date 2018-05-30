import * as React from "react";
import { Cell, Grid } from "./Grid";

const SourcePagePaneStyle = require("../themes/amazon_pane.scss");

export interface SourcePageTwoPaneProps {
    spacing?: boolean;
    leftStyle?: React.CSSProperties;
    rightStyle?: React.CSSProperties;
    isYamlEditor?: boolean;
}

interface TwoPaneState {
}

/**
 * A widget that splits two children in half and keeps their sizes stable to the size of this widget. That means that
 * the children will be responsible for their scrolling should them become larger than this widget.
 */
export class SourcePageTwoPane extends React.Component<SourcePageTwoPaneProps, TwoPaneState> {
    static defaultProps: SourcePageTwoPaneProps = {
        spacing: true,
        leftStyle: {},
        rightStyle: {},
    };

    constructor(props: SourcePageTwoPaneProps) {
        super(props);
    }

    render(): JSX.Element {
        const leftObj = (this.props as any).children[0];
        const rightObj = (this.props as any).children[1];
        return (
            <Grid
                className={SourcePagePaneStyle.main_grid}
                noSpacing={this.props.spacing}>
                <Cell className={`${SourcePagePaneStyle.left_cell} ${this.props.isYamlEditor ? SourcePagePaneStyle.yaml_editor : ""}`} col={9} phone={4} tablet={6}>
                    <div className={SourcePagePaneStyle.left_container} style={this.props.leftStyle}>
                        {leftObj}
                    </div>
                </Cell>
                <Cell className={`${SourcePagePaneStyle.right_cell} ${this.props.isYamlEditor ? SourcePagePaneStyle.yaml_editor : ""}`} col={3} hidePhone={true} tablet={2}>
                    <div className={SourcePagePaneStyle.right_container} style={this.props.rightStyle}>
                        {rightObj}
                    </div>
                </Cell>
            </Grid >
        );
    }
}

export default SourcePageTwoPane;
