import { IAction, IState } from '@etsoo/appscript';
import React from 'react';

/**
 * State UI creator
 */
export interface IUICreator<S extends IState, A extends IAction, P = {}> {
    (state: S, dispatch: React.Dispatch<A>, props: P): React.ReactElement;
}

/**
 * State update interface
 */
export interface IUpdate<S extends IState, A extends IAction> {
    state: S;
    dispatch: React.Dispatch<A>;
}

/**
 * State provider update callback
 */
export interface IProviderUpdate<S extends IState, A extends IAction> {
    (update: IUpdate<S, A>): void;
}

/**
 * State provider props
 */
export interface IProviderProps<S extends IState, A extends IAction> {
    Update?: IProviderUpdate<S, A>;
}
