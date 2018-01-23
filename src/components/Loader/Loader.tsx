import * as React from "react";
const LoaderStyle = require("../../themes/loader-component.scss");

interface LoaderProps { };

export const Loader: React.SFC<LoaderProps> = (props) => {
    return (
        <div className={LoaderStyle.loader_parent} >
            <div className={LoaderStyle.loader} /></ div>
    );
};