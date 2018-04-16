import * as Bluebird from "bluebird";
import * as React from "react";

Bluebird.config({
    cancellation: true
});

export enum LoadingState {
    NOT_LOADING, LOADING, LOADED, LOAD_ERROR
}

export interface LoadingComponentProps {

}

export interface LoadingComponentState<DATA> {
    data: DATA;
    state: LoadingState;
}

/**
 * A loading component that is designed to load data asyncronously from the component. It will automatically cancel
 * if the data was not loaded and the component was unmounted or received new props.  Overriding components can
 * override the various methods to perform during the loading chain.
 *
 * The loading state is handled by this component and shoud not be written to outside of it.  In other words,
 * don't ever overwrite the state object like "this.state = <some new state>".
 */
export class Component<DATA, P extends LoadingComponentProps, S extends LoadingComponentState<DATA>> extends React.Component<P, S> {

    static TAG = "LoadingComponent";

    loadingPromise: Bluebird<any>;

    constructor(props: P, defaultState: S) {
        super(props);

        this.preLoad = this.preLoad.bind(this);
        this.startLoading = this.startLoading.bind(this);
        this.map = this.map.bind(this);

        const realDefault = defaultState || {};
        this.state = { ...realDefault as any, ...{ state: LoadingState.NOT_LOADING } };
    }

    /**
     * Children can override this to determine if the new props warrents an update.  If not, then no update will occur.
     * Default is always true.
     * @param oldProps
     *      Old props to check against.
     *
     * @param newProps
     *      New props to check.  Can be null if mounting for the first time.
     */
    shouldUpdate(oldProps: P, newProps?: P | undefined): boolean {
        return true;
    }

    /**
     * Overriding components *must* call the super of this method.
     */
    componentWillReceiveProps(newProps: P, context: any) {
        if (this.shouldUpdate(this.props, newProps)) {
            this.forceLoading(newProps);
        }
    }

    /**
     * Overriding components *must* call the super of this method.
     */
    componentWillMount() {
        if (this.shouldUpdate(this.props)) {
            this.forceLoading(this.props);
        }
    }

    /**
     * Overriding components *must* call the super of this method.
     */
    componentWillUnmount() {
        this.cancel();
    }

    /**
     * Force a reload of the data.
     */
    forceLoading(props: P) {
        this.cancel();
        this.loadingPromise = Bluebird
            .resolve(this.preLoad(props))
            .then((preloadState: any) => {
                const stateObj = { state: LoadingState.LOADING };
                this.setState({ ...preloadState, ...stateObj });
                return props;
            })
            .then((props: P) => {
                return this.startLoading(props);
            })
            .then(function (result: any) {
                return result;
            })
            .then(this.map)
            .then((data: DATA) => {
                return this.mapState({ data: data, state: LoadingState.LOADED });
            })
            .catch((err: Error) => {
                this.onLoadError(err);
                return this.mapState({ state: LoadingState.LOAD_ERROR });
            })
            .then((state: S) => {
                this.setState(state);
            });
    }

    /**
     * Children can override this to provide state feedback for when the content is about to be loaded.
     * @param props Props about to be sent to "startLoading";
     */
    preLoad(props: P): Thenable<S> | S {
        return this.state;
    }

    startLoading<T>(props: P): Thenable<T> | T {
        return {} as any;
    }

    map<FROM, TO>(data: FROM): Thenable<TO> | TO {
        return data as any;
    }

    /**
     * Children can override this to provide state feedback.
     * @param err Error that was caught.
     */
    onLoadError(err: Error): S {
        console.error(err);
        return this.state;
    }

    cancel() {
        if (this.loadingPromise) {
            this.loadingPromise.cancel();
        }
    }

    /**
     * Maps an object to the current state without updating the state. This may be necessary in the
     * long processes so `setState` is only called once in a chain.
     */
    mapState(obj: any): S {
        const currentState = this.state as any;
        return { ...currentState, ...obj };
    }

    render() {
        // Mostly to allow testing.  This won't actually show anything because that's the children's responsibility.
        return (<div />);
    }
}

export default Component;
