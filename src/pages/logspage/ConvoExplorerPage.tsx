import * as React from "react";

import TwoPane from "../../components/TwoPane";
import Conversation from "../../models/conversation";
import ConvoListPage from "./ConvoListPage";
import ConvoViewPage from "./ConvoViewPage";
import { CompositeFilter } from "./filters/Filters";

interface ConvoExplorerPageProps {
    filter?: CompositeFilter<Conversation>;
    refreshOn?: boolean;
    onIconClick?: (conversation: Conversation) => void;
    iconStyle?: React.CSSProperties;
    iconTooltip?: string;
}

interface ConvoExplorerPageState {
    selectedConvo: Conversation;
}

export class ConvoExplorerPage extends React.Component<ConvoExplorerPageProps, ConvoExplorerPageState> {

    constructor(props: ConvoExplorerPageProps) {
        super(props);

        this.handleItemClick = this.handleItemClick.bind(this);

        this.state = {
            selectedConvo: undefined
        };
    }

    handleItemClick(convo: Conversation) {
        this.state.selectedConvo = convo;
        this.setState(this.state);
    }

    render() {
        return (
            <TwoPane
                leftStyle={{ paddingLeft: "5px", paddingRight: "5px", zIndex: 1 }}
                rightStyle={{ paddingLeft: "5px", paddingRight: "5px" }}
                spacing={true}>
                <ConvoListPage
                    {...this.props}
                    onItemClick={this.handleItemClick} />
                <ConvoViewPage
                    conversation={this.state.selectedConvo} />
            </TwoPane>
        );
    }
}

export default ConvoExplorerPage;