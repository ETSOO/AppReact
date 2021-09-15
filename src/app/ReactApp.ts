import {
    CoreApp,
    IAppSettings,
    ICoreApp,
    IUser,
    IUserData
} from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import React from 'react';
import { NotifierPromptProps } from '../mu/NotifierPromptProps';
import { CultureAction } from '../states/CultureState';
import { IStateProps } from '../states/IState';
import { PageAction, PageActionType } from '../states/PageState';
import {
    UserAction,
    UserActionType,
    UserCalls,
    UserState
} from '../states/UserState';
import { InputDialogProps } from './InputDialogProps';

let app: IReactApp<IAppSettings, any>;

/**
 * React app state detector
 * @param props Props
 * @returns Component
 */
export function ReactAppStateDetector(props: IStateProps) {
    // Destruct
    const { update } = props;

    // Context
    const { state } =
        app == null
            ? ({ state: {} } as UserCalls<IUser>)
            : React.useContext((app.userState as UserState<IUser>).context);

    // Ready
    React.useEffect(() => {
        // Callback
        update(state.authorized);
    }, [state.authorized]);

    // return
    return React.createElement(React.Fragment);
}

/**
 * Core application interface
 */
export interface IReactApp<S extends IAppSettings, D extends IUser>
    extends ICoreApp<S, React.ReactNode> {
    /**
     * User state
     */
    readonly userState: UserState<D>;
}

/**
 * React application
 */
export abstract class ReactApp<S extends IAppSettings, D extends IUser>
    extends CoreApp<S, React.ReactNode>
    implements IReactApp<S, D>
{
    /**
     * User state
     */
    readonly userState = new UserState<D>();

    /**
     * Page state dispatch
     */
    pageStateDispatch?: React.Dispatch<PageAction>;

    /**
     * User state dispatch
     */
    userStateDispatch?: React.Dispatch<UserAction<D>>;

    /**
     * Override setup to hold userState
     */
    override setup() {
        super.setup();
        app = this;
    }

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
     * Set page title and data
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
     * Set page title and data
     * @param key Page title resource key
     * @param data Page data
     */
    setPageKey(key: string, data?: {}): void {
        this.setPageTitle(this.get<string>(key) ?? '', data);
    }

    /**
     * Show input dialog
     * @param props Props
     */
    showInputDialog({
        title,
        message,
        inputs,
        callback,
        cancelLabel,
        okLabel
    }: InputDialogProps): void {
        const props: NotifierPromptProps = {
            okLabel,
            cancelLabel,
            inputs
        };
        this.notifier.prompt<HTMLFormElement>(message, callback, title, props);
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
