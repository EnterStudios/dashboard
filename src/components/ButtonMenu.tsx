import * as React from "react";
import { Button } from "react-toolbox/lib/button";
import { Menu } from "react-toolbox/lib/menu";
const MenuButtonTheme = require("../themes/button_menu_theme.scss");

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
                <a className="integration_docs_link email" target="_blank">{this.props.userEmail}</a>
                <Button className={this.props.className} primary={this.props.primary} raised={this.props.raised} onClick={this.handleButtonClick} label={this.props.label} />
                <Menu position={this.props.position} active={this.state.active} onHide={this.handleMenuHide}>
                    {this.props.children}
                </Menu>
            </div>
        );
    }
}

export default ButtonMenu;
