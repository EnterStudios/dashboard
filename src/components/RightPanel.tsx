import * as React from "react";
import { Button } from "react-toolbox/lib/button";

const ButtonTheme = require("../themes/button_theme.scss");
const VendorPaneStyle = require("../themes/amazon_pane.scss");

export default class RightPanel extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <a>
                <img src="https://bespoken.io/wp-content/uploads/2018/01/Input_Results-AfterToken.jpg" />
                <div className={VendorPaneStyle.right_backdrop} />
                <div className={VendorPaneStyle.right_content} >
                    <h3><strong>UNLEASH THE <u>BEAST!</u></strong></h3>
                    <h4>Integrate your Voice App with:</h4>
                    <h4>Bespoken</h4>
                    <ul>
                        <li>- Check your voice application <span>logs</span> and find out errors </li>
                        <li>- Proactive <span>alerting</span> when there are problems</li>
                    </ul>
                    <div>
                        <p>We value your time: <strong>5 min set-up</strong></p>
                        <Button
                            className={VendorPaneStyle.get_started}
                            theme={ButtonTheme}
                            raised={true}
                            primary={true}
                            onClick={this.props.handleGetStarted}
                            label="Get Started - FREE"/>
                    </div>
                </div>
            </a>
        );
    }
}
