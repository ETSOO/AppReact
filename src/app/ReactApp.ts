import { CoreApp, IAppSettings, IUser, IUserData } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import React from 'react';
import { CultureAction } from '../states/CultureState';
import { IStateProps } from '../states/IState';
import { UserAction, UserActionType, UserState } from '../states/UserState';

/**
 * React application
 */
export abstract class ReactApp<
    S extends IAppSettings,
    D extends IUser
> extends CoreApp<S, React.ReactNode> {
    /**
     * User state
     */
    readonly userState = new UserState<D>();

    /**
     * User state update component
     * @returns Component
     */
    readonly userStateUpdate = (props: IStateProps<D>) => {
        // Consumer
        const consumer = this.userState.context.Consumer;

        // Create element
        return React.createElement(consumer, {
            children: (value) => {
                props.update(value.state);
                return undefined;
            }
        });
    };

    /**
     * User state dispatch
     */
    userStateDispatch?: React.Dispatch<UserAction>;

    /**
     * Change culture extended
     * @param dispatch Dispatch method
     * @param culture New culture definition
     */
    changeCultureEx(
        dispatch: React.Dispatch<CultureAction>,
        culture: DataTypes.CultureDefinition
    ): void {
        // Dispatch action
        dispatch(culture);

        // Super call
        super.changeCulture(culture);
    }

    /**
     * User login extended
     * @param user New user
     * @param refreshToken Refresh token
     * @param keep Keep in local storage or not
     */
    userLogin(user: IUserData, refreshToken?: string, keep?: boolean): void {
        // Dispatch action
        if (this.userStateDispatch != null)
            this.userStateDispatch({
                type: UserActionType.Login,
                user
            });

        // Super call
        super.userLogin(user, refreshToken, keep);
    }

    /**
     * User logout extended
     */
    userLogout(): void {
        // Dispatch action
        if (this.userStateDispatch != null)
            this.userStateDispatch({
                type: UserActionType.Logout
            });

        // Super call
        super.userLogout();
    }
}
