import { IAction, IState } from '@etsoo/appscript';
import React from 'react';

/**
 * State UI creator
 */
export interface IUICreator<S extends IState, A extends IAction> {
    (state: S, dispatch: React.Dispatch<A>): JSX.Element;
}

/**
 * State update interface
 */
export interface IUpdate<S extends IState, A extends IAction> {
    state: S;
    dispatch: React.Dispatch<A>;
}