import * as React from "react";

const BillCardStyle = require("./BillCardStyle.scss");

interface BillCardProps {
    uriImage: string;
    letterColor: string;
    containterColor: string;
    footerColor: string;
    alt: string;
    buttonColor: string;

    unitTest: string;
    numVirtualDevice: string;
    numSkills: string;
    numLogs: string;
    numUsers: string;
    price: string;

}

interface BillCardState {
}

export default class BillCard extends React.Component<BillCardProps, BillCardState> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={BillCardStyle.container} style={{ color: this.props.letterColor, background: this.props.containterColor }}>
                <div>
                    <div className={BillCardStyle.img} >
                        <img className={BillCardStyle.img} src={this.props.uriImage} alt={this.props.alt} />
                        <button className={BillCardStyle.button} style={{ backgroundColor: this.props.buttonColor }} >{this.props.alt}</button>
                    </div>
                </div>

                <div className={BillCardStyle.containerFooter} style={{ background: this.props.footerColor }} />
                <div  >
                    <p>{this.props.unitTest} </p>
                    <p>{this.props.numVirtualDevice} </p>
                </div>
                <div className={BillCardStyle.containerFooter} style={{ background: this.props.footerColor }} />
                <div style={{ background: this.props.containterColor }}>
                    <p>{this.props.numSkills} </p>
                    <p>{this.props.numLogs} </p>
                    <p>{this.props.numUsers}</p>
                </div>
                <div className={BillCardStyle.containerFooter} style={{ background: this.props.footerColor }} >
                    <b>{this.props.price}</b>
                </div>

            </div >
        );
    }
}
