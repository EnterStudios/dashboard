import * as moment from "moment";
import * as React from "react";
import RightPanel from "../components/RightPanel";
import Source from "../models/source";
import service from "../services/source";

export default class WelcomePage extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.handleGetStarted = this.handleGetStarted.bind(this);
    }

    async handleGetStarted () {
        if (this.props.source && this.props.source.id) {
            this.props.goTo("/skills/" + this.props.source.id + "/integration");
        } else {
            this.props.handleLoadingChange(true);
            const source: Source = new Source({name: "default1", created: moment().toISOString()});
            const createdSource = await service.createSource(source);
            await this.props.getSources();
            this.props.handleLoadingChange(false);
            this.props.goTo(`/skills/${createdSource.id}/`);
        }
    }

    render() {
        return (
            <RightPanel type={"sourceListPage"} handleGetStarted={this.handleGetStarted} />
        );
    }
};

