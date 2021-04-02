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
    public static create<S extends IState, A extends IAction>(
        reducer: React.Reducer<S, A>,
        initState: S,
        uiCreator?: IUICreator<S, A>
    ) {
        // State context
        const context = React.createContext({} as IUpdate<S, A>);

        // State context provider
        const provider: React.FunctionComponent = (props) => {
            // Destruct
            const { children } = props;

            // Update reducer
            const [state, dispatch] = React.useReducer(reducer, initState);

            // Context default value
            const contextValue = { state, dispatch };

            if (uiCreator) {
                return uiCreator(state, dispatch);
            } else {
                return (
                    <context.Provider value={contextValue}>
                        {children}
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
