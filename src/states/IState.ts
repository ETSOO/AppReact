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
 * State update interface
 */
export interface IStateUpdate<S extends IState> {
    (state: S): void;
}

/**
 * State update props
 */
export interface IStateProps<S extends IState> {
    update: IStateUpdate<S>;
}

/**
 * State provider update callback
 */
export interface IProviderUpdate<A extends IAction> {
    (dispatch: React.Dispatch<A>): void;
}

/**
 * State provider props
 */
export interface IProviderProps<A extends IAction> {
    update?: IProviderUpdate<A>;
}
