import * as React from "react";
import { Button } from "react-toolbox/lib/button";

const ButtonTheme = require("../themes/button_theme.scss");
const VendorPaneStyle = require("../themes/amazon_pane.scss");

export default class RightPanel extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        // TODO: if possible and necessary refactor this one to use different components instead of an if condition
        return this.props && this.props.type && this.props.type === "sourceListPage" ?
            (
                <a>
                    <img src={"https://bespoken.io/wp-content/uploads/2018/03/right-sourcelist.jpg"}/>
                    <div className={VendorPaneStyle.right_backdrop}/>
                    <div className={`${VendorPaneStyle.right_content} ${VendorPaneStyle.source_list}`}>
                        <h3><strong>Did you know?</strong><img className={VendorPaneStyle.white_llama} src={"https://bespoken.io/wp-content/uploads/2018/03/llama.png"} alt="bespoken logo white" /></h3>
                        <h4>You can access <span>20+ more metrics</span></h4>
                        <ul>
                            <li>- Find errors in your <span>logs</span></li>
                            <li>- Get <span>alerts</span> when there are issues</li>
                            <li>- See uptime, events, and more</li>
                        </ul>
                        <div className={VendorPaneStyle.get_stated_container}>
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
            ) :
            (
                <a>
                    <img src={"https://bespoken.io/wp-content/uploads/2018/03/right-validation.jpg"}/>
                    <div className={VendorPaneStyle.right_backdrop}/>
                    <div className={VendorPaneStyle.right_content}>
                        <h3><strong>UNLEASH THE <u>BEAST!</u></strong></h3>
                        <h4>Integrate your Voice App with:</h4>
                        <h4>Bespoken</h4>
                        <ul>
                            <li>- Check your voice application <span>logs</span> and find out errors</li>
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
