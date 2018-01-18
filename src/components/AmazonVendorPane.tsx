import * as classNames from "classnames";
import * as React from "react";
import { IconButton } from "react-toolbox";
import { Button } from "react-toolbox/lib/button";
import Input from "react-toolbox/lib/input";
import auth from "../services/auth";
import { Dimensions, Measure } from "./Measure";
import LandingAmazonPageTwoPane from "./SourcePageTwoPane";

import Tooltip from "react-toolbox/lib/tooltip";

const ButtonTheme = require("../themes/button_theme.scss");
const InputTheme = require("../themes/input.scss");
const VendorPaneStyle = require("../themes/amazon_pane.scss");

const TooltipButton = Tooltip(IconButton);

export default class AmazonVendorPane extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            myHeight: 0,
            vendorID: ""
        };

        this.onMeasure = this.onMeasure.bind(this);
        this.handleVendorIDChange = this.handleVendorIDChange.bind(this);
        this.handleUpdateVendorId = this.handleUpdateVendorId.bind(this);
    }

    onMeasure(dimensions: Dimensions) {
        this.setState({ ...this.state, myHeight: dimensions.height });
    }

    handleVendorIDChange(value: string) {
        this.setState({ ...this.state, vendorID: value });
    }

    async handleUpdateVendorId() {
        const updatedUser = await auth.updateCurrentUser({ vendorID: this.state.vendorID });
        if (updatedUser) {
            // finish importing sources and redirect to validation page
        } else {
            // redirect to landing no amazon flow dispatch(setAmazonFlow(undefined))
        }
    }

    render() {
        const spacing = this.props.spacing !== undefined && this.props.spacing;
        const redirectoToVendorIdpage = () => window.open("https://developer.amazon.com/mycid.html", "_blank");
        return (
            <Measure
                onMeasure={this.onMeasure}>
                <LandingAmazonPageTwoPane spacing={spacing}>
                    {(
                        <div className={VendorPaneStyle.main_content}>
                            <h5>We only need one more piece of
                                information before getting you started</h5>
                            <h4>
                                Please enter on here your vendor ID
                                <TooltipButton className={VendorPaneStyle.info_button} onClick={redirectoToVendorIdpage} icon={"info"} tooltip={"To retrieve your vendor ID go to https://developer.amazon.com/mycid.html Please make sure it is for the correct organization if you belong to multiple."} />
                            </h4>
                            <span>
                                <Input
                                    className={classNames(InputTheme.vendor_id_input)}
                                    style={{ color: "#000" }}
                                    theme={InputTheme}
                                    label="Vendor ID"
                                    value={this.state.vendorID}
                                    onChange={this.handleVendorIDChange}
                                    required={true} />
                            </span>
                            <small>To retrieve your vendor ID, <a href="https://developer.amazon.com/mycid.html"
                                target="_blank">click here</a>
                            </small>
                            <Button
                                className={VendorPaneStyle.vendor_button}
                                theme={ButtonTheme}
                                raised={true}
                                primary={true}
                                onClick={this.handleUpdateVendorId}
                                label="Get Started  >" />
                        </div>
                    )}
                    {(
                        <a>
                            <img src="https://bespoken.io/wp-content/uploads/2018/01/placeholder.jpg" />
                        </a>
                    )}
                </LandingAmazonPageTwoPane>
            </Measure>
        );
    }
}
