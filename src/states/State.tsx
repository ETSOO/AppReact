import { IAction, IState } from '@etsoo/appscript';
import React from 'react';
import { IUICreator, IUpdate } from './IState';

/**
 * State
 */
export class State {
    /**
     * Generic to create state context and provider
     * @param reducer Reduce function
     * @param initState Init state
     * @param uiCreator Additional UI creator
     */
    public static create<
        S extends IState,
        A extends IAction,
        U extends IUpdate<S, A> = IUpdate<S, A>,
        P = {}
    >(
        reducer: React.Reducer<S, A>,
        initState: S,
        calls: U,
        uiCreator?: IUICreator<S, A, P>
    ) {
        // State context
        const context = React.createContext(calls);

        // State context provider
        const provider: React.FunctionComponent<P> = (props) => {
            // Update reducer
            const [state, dispatch] = React.useReducer(reducer, initState);

            if (uiCreator) {
                // Custom renderer
                return uiCreator(state, dispatch, props);
            } else {
                // Context new value
                const value = { ...calls, state, dispatch };

                return (
                    <context.Provider value={value}>
                        {props.children}
                    </context.Provider>
                );
            }
        };

        // Return
        return {
            context,
            provider
        };
    }
}
