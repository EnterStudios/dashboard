import * as React from "react";
import { Button } from "react-toolbox/lib/button";
import { Menu } from "react-toolbox/lib/menu";
import Tooltip from "react-toolbox/lib/tooltip";
const MenuButtonTheme = require("../themes/button_menu_theme.scss");

class ReactA extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        const {theme, ...rest} = this.props;
        return (
            <a {...rest} >{this.props.children}</a>
        );
    }
}

const TooltipA = Tooltip(ReactA);

interface ButtonMenuProps {
  position?: "auto" | "static" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  primary?: boolean;
  raised?: boolean;
  label?: string;
  className?: string;
  userEmail?: string;
};

class ButtonMenu extends React.Component<ButtonMenuProps, any> {
    state = { active: false };
    handleButtonClick = () => this.setState({ active: !this.state.active });
    handleMenuHide = () => this.setState({ active: false });
    render () {
        return (
            <div className={MenuButtonTheme.menu_container}>
                <a className="integration_docs_link" href="http://docs.bespoken.io/en/latest/" target="_blank">Integration Docs</a>
                <TooltipA tooltip={this.props.userEmail} className="integration_docs_link email" target="_blank">{this.props.userEmail}</TooltipA>
                <Button className={this.props.className} primary={this.props.primary} raised={this.props.raised} onClick={this.handleButtonClick} label={this.props.label} />
                <Menu position={this.props.position} active={this.state.active} onHide={this.handleMenuHide}>
                    {this.props.children}
                </Menu>
            </div>
        );
    }
}

export default ButtonMenu;
