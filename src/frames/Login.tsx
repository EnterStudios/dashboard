import * as classNames from "classnames";
import * as React from "react";
import { connect } from "react-redux";

import Content from "../components/Content";
import Layout from "../components/Layout";
import Snackbar from "../components/Snackbar";
import { CLASSES } from "../constants";
import { State } from "../reducers";
import "../themes/main-baseline";

interface LoginProps {
    snackBarMessage: string;
    classNames?: string;
}

function mapStateToProps(state: State.All) {
    return {
        snackBarMessage: state.notification.snackBarMessage
    };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>) {
    return { /* nothing to match at the moment */ };
}

export class Login extends React.Component<LoginProps, any> {

    classes() {
        return classNames(this.props.classNames, CLASSES.COLOR.CYAN_BESPOKEN, "main_layout");
    }

    componentDidMount () {
        document.title = "Bespoken Dashboard";
        window.localStorage.setItem("contest", "");
    }

    handleBannerButtonClick = async () => {
        // get url from dev bespoken tools
        window.open("https://www.google.com", "_blank");
    }

    render() {
        return (
            <Layout>
                <Content classNames={this.classes()} >
                    {this.props.children}
                </Content>
                <Snackbar text={this.props.snackBarMessage} />
                <div className={"banner_button"} onClick={this.handleBannerButtonClick} />
            </Layout>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Login);
