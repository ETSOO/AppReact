import { CoreApp, IAppSettings, IUserData } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import React from 'react';
import { CultureAction } from '../states/CultureState';
import { UserAction, UserActionType } from '../states/UserState';

/**
 * React application
 */
export abstract class ReactApp<S extends IAppSettings> extends CoreApp<
    S,
    React.ReactNode
> {
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
     * @param dispatch Dispatch method
     * @param user New user
     * @param refreshToken Refresh token
     * @param keep Keep in local storage or not
     */
    userLoginEx(
        dispatch: React.Dispatch<UserAction>,
        user: IUserData,
        refreshToken?: string,
        keep?: boolean
    ): void {
        // Dispatch action
        dispatch({
            type: UserActionType.Login,
            user
        });

        // Super call
        super.userLogin(user, refreshToken, keep);
    }

    /**
     * User logout extended
     * @param dispatch Dispatch method
     */
    userLogoutEx(dispatch: React.Dispatch<UserAction>): void {
        // Dispatch action
        dispatch({
            type: UserActionType.Logout
        });

        // Super call
        super.userLogout();
    }
}
