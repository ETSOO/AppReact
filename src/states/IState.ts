import { IAction, IState, UserKey } from '@etsoo/appscript';
import React, { ReactNode } from 'react';

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
export interface IStateUpdate {
    (authorized?: boolean, matchedFields?: string[]): PromiseLike<void> | void;
}

/**
 * State update props
 */
export interface IStateProps {
    /**
     * State last changed fields
     */
    targetFields?: UserKey[];

    /**
     * State update callback
     */
    update: IStateUpdate;
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
    /**
     * Children
     */
    children?: ReactNode | undefined;

    /**
     * Update callback
     */
    update?: IProviderUpdate<A>;
}
