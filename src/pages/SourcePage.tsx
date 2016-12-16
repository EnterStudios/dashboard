import * as moment from "moment";
import * as React from "react";
import { connect } from "react-redux";
import { VictoryPie } from "victory";

import { Cell, Grid } from "../components/Grid";
import Source from "../models/source";
import { State } from "../reducers";

interface SourcePageProps {
    source: Source;
}

function mapStateToProps(state: State.All) {
    return {
        source: state.source.currentSource
    };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>) {
    return {
    };
}

export class SourcePage extends React.Component<SourcePageProps, any> {
    render() {
        return (
            <span>
                <Grid style={{ backgroundColor: "grey" }}>
                    <Cell col={12} >
                        {this.props.source ? (
                            <span>
                                <span> Project Name </span>
                                <span> {this.props.source.name} </span>
                                <span> Project ID </span>
                                <span> {this.props.source.id} </span>
                                <span> Created {moment(this.props.source.created).format("MMM Do, YYYY")} </span>
                            </span>
                        ) : undefined}
                    </Cell>
                </Grid>
                <Grid>
                    <Cell col={4}> <VictoryPie /> </Cell>
                </Grid>
            </span>
        );

    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SourcePage);