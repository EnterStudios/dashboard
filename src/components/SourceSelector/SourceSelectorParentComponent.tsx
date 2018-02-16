import * as React from "react";
import Source from "../../models/source";

const SourceSelectorStyle = require("./SourceSelectorParentStyle.scss");

interface SourceSelectorProps {
    sources: Source[];
    goTo?: (path: string) => (dispatch: Redux.Dispatch<any>) => void;
}

interface SourceSelectorState {
    source?: Source;
}

export default class SourceSelector extends React.Component<SourceSelectorProps, SourceSelectorState> {

    constructor(props: SourceSelectorProps) {
        super(props);

        this.handleSourceClick = this.handleSourceClick.bind(this);
    }

    handleSourceClick (sourceId: string) {
        this.props.goTo && this.props.goTo(`/skills/${sourceId}`);
    }

    render() {
        return (
            <div className={SourceSelectorStyle.container}>
                <div className={SourceSelectorStyle.item}>
                    Create new skill
                </div>
                {
                    this.props.sources && this.props.sources.length &&
                    this.props.sources.map((source, index) => {
                        const onclick = () => {
                            this.handleSourceClick(source.id);
                        };
                        return (
                            <div key={index} id={source.id} onClick={onclick} className={SourceSelectorStyle.item}>
                                {source.name}
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}
