import * as React from "react";
import { connect } from "react-redux";

import { Cell, Grid } from "../components/Grid";
import { State } from "../reducers";

interface MetricsPageProps {

}

interface MetricsPageState {

}

function mapStateToProps(state: State.All) {
    return {
    };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>) {
    return {

    };
}

export class MetricsPage extends React.Component<MetricsPageProps, MetricsPageState> {

    render() {
        return (
            <Grid>
                <Cell>
                    <p>Hello</p>
                </Cell>
            </Grid>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MetricsPage);