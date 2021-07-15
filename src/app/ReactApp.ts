import { CoreApp, IAppSettings, IUser, IUserData } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import React from 'react';
import { CultureAction } from '../states/CultureState';
import { IStateProps } from '../states/IState';
import { PageAction, PageActionType } from '../states/PageState';
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
     * User authentification state update component
     * @returns Component
     */
    readonly userStateUpdate = (props: IStateProps) => {
        // Destruct
        const { update } = props;

        // Context
        const { state } = React.useContext(this.userState.context);

        // Ready
        React.useEffect(() => {
            // Callback
            update(state.authorized);
        }, [state.authorized]);

        /*
        // Create element
        return React.createElement(consumer, {
            children: (value) => {
                const { state } = value;
                React.useEffect(() => {
                    update(state);
                }, [state]);

                return undefined;
            }
        });
        */

        // return
        return React.createElement(React.Fragment);
    };

    /**
     * Page state dispatch
     */
    pageStateDispatch?: React.Dispatch<PageAction>;

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
     * Set page data
     * @param data Page data
     */
    setPageData(data: {}): void {
        // Dispatch the change
        if (this.pageStateDispatch != null) {
            this.pageStateDispatch({
                type: PageActionType.Data,
                data
            });
        }
    }

    /**
     * Set page title
     * @param title Page title
     * @param data Page data
     */
    setPageTitle(title: string, data?: {}): void {
        // Dispatch the change
        if (this.pageStateDispatch != null) {
            this.pageStateDispatch({
                type: PageActionType.Title,
                title,
                data
            });
        }
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
