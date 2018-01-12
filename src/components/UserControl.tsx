import * as React from "react";

import User from "../models/user";
import { Icon, ICON } from "./Icon";
import { Menu, MenuItem } from "./Menu";

const TopBarTheme = require("../themes/topbar_theme.scss");

interface UserProps {
  user?: User;
  login: () => void;
  logout: () => void;
}

export default class UserControl extends React.Component<UserProps, any> {

  render() {

    let callback = this.props.user ? this.props.logout : this.props.login;
    let buttonText = this.props.user ? "Logout" : "Login";

    let icon = this.props.user && this.props.user.photoUrl ? (
      <img
        style={{ borderRadius: "50%" }}
        width="65"
        height="65"
        src={this.props.user.photoUrl}
        />
    ) : (
        <Icon
          style={{width: 65, height: 65}}
          icon={ICON.DEFAULT_AVATAR}
          />
      );
    return (
      <Menu
          className={TopBarTheme.user_control_button}
        icon={icon}
        position="topRight"
        menuRipple={true}>
        <MenuItem
          caption={buttonText}
          onClick={callback} />
      </Menu>
    );
  }
}
