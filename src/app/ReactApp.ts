import {
    CoreApp,
    IAppSettings,
    ICoreApp,
    IUser,
    IUserData
} from '@etsoo/appscript';
import { NotificationRenderProps } from '@etsoo/notificationbase';
import { DataTypes, Utils } from '@etsoo/shared';
import React from 'react';
import { ProgressCount } from '../mu/ProgressCount';
import { NotificationReactCallProps } from '../notifier/Notifier';
import { CultureAction, CultureState } from '../states/CultureState';
import { IStateProps } from '../states/IState';
import { IPageData, PageAction, PageActionType } from '../states/PageState';
import {
    UserAction,
    UserActionType,
    UserCalls,
    UserState
} from '../states/UserState';
import { InputDialogProps } from './InputDialogProps';
import { Labels } from './Labels';

let app: IReactApp<IAppSettings, any, any>;

/**
 * React app state detector
 * Case 1: undefined, when refresh the whole page
 * Case 2: false, unauthorized
 * Case 3: true, authorized or considered as authorized (maynot, like token expiry)
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
export interface IReactApp<
    S extends IAppSettings,
    D extends IUser,
    P extends IPageData
> extends ICoreApp<S, React.ReactNode, NotificationReactCallProps> {
    /**
     * User state
     */
    readonly userState: UserState<D>;

    /**
     * Set page data
     * @param data Page data
     */
    setPageData(data: P): void;

    /**
     * Set page title and data
     * @param key Page title resource key
     */
    setPageKey(key: string): void;

    /**
     * Set page title and data
     * @param title Page title
     */
    setPageTitle(title: string): void;
}

/**
 * React application
 */
export abstract class ReactApp<
        S extends IAppSettings,
        D extends IUser,
        P extends IPageData
    >
    extends CoreApp<S, React.ReactNode, NotificationReactCallProps>
    implements IReactApp<S, D, P>
{
    /**
     * User state
     */
    readonly userState = new UserState<D>();

    private static _notifierProvider: React.FunctionComponent<NotificationRenderProps>;

    /**
     * Get notifier provider
     */
    static get notifierProvider() {
        return ReactApp._notifierProvider;
    }

    /**
     * Set notifier provider
     */
    protected static set notifierProvider(value) {
        ReactApp._notifierProvider = value;
    }

    private static _cultureState: CultureState;

    /**
     * Get culture state
     */
    static get cultureState() {
        return ReactApp._cultureState;
    }

    /**
     * Set culture state
     */
    protected static set cultureState(value) {
        ReactApp._cultureState = value;
    }

    /**
     * Is screen size down 'sm'
     */
    smDown?: boolean;

    /**
     * Is screen size up 'md'
     */
    mdUp?: boolean;

    /**
     * Page state dispatch
     */
    pageStateDispatch?: React.Dispatch<PageAction<P>>;

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
     * Change culture
     * @param culture New culture definition
     */
    override changeCulture(culture: DataTypes.CultureDefinition) {
        // Super call to update cultrue
        super.changeCulture(culture);

        // Update component labels
        Labels.setLabels(culture.resources, {
            notificationMU: {
                alertTitle: 'warning',
                alertOK: 'ok',
                confirmTitle: 'confirm',
                confirmYes: 'ok',
                confirmNo: 'cancel',
                promptTitle: 'prompt',
                promptCancel: 'cancel',
                promptOK: 'ok'
            }
        });

        // Document title
        document.title = this.get(this.name) ?? this.name;
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
        // Same?
        if (culture.name === this.culture) return;

        // Dispatch action
        dispatch(culture);

        // Super call
        this.changeCulture(culture);
    }

    /**
     * Get date format props
     * @returns Props
     */
    getDateFormatProps() {
        return { culture: this.culture, timeZone: this.getTimeZone() };
    }

    /**
     * Get money format props
     * @returns Props
     */
    getMoneyFormatProps() {
        return { culture: this.culture, currency: this.currency };
    }

    /**
     * Fresh countdown UI
     * @param callback Callback
     */
    freshCountdownUI(callback?: () => PromiseLike<unknown>) {
        // Labels
        const labels = this.getLabels('cancel', 'tokenExpiry');

        // Progress
        const progress = React.createElement(ProgressCount, {
            seconds: 30,
            valueUnit: 's',
            onComplete: () => {
                // Stop the progress
                return false;
            }
        });

        // Popup
        this.notifier.alert(
            labels.tokenExpiry,
            async () => {
                if (callback) await callback();
                else await this.tryLogin();
            },
            {
                okLabel: labels.cancel,
                primaryButton: { fullWidth: true, autoFocus: false },
                inputs: progress
            }
        );
    }

    /**
     * Set page data
     * @param data Page data
     */
    setPageData(data: P): void {
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
     */
    setPageTitle(title: string): void {
        // Data
        const data = { title } as P;

        // Dispatch the change
        if (this.pageStateDispatch != null) {
            this.pageStateDispatch({
                type: PageActionType.Title,
                data
            });
        }
    }

    /**
     * Set page title and data
     * @param key Page title resource key
     */
    setPageKey(key: string): void {
        this.setPageTitle(this.get<string>(key) ?? '');
    }

    /**
     * Show input dialog
     * @param props Props
     */
    showInputDialog({
        title,
        message,
        callback,
        ...rest
    }: InputDialogProps): void {
        this.notifier.prompt<HTMLFormElement | undefined>(
            message,
            callback,
            title,
            rest
        );
    }

    /**
     * User login extended
     * @param user New user
     * @param refreshToken Refresh token
     * @param keep Keep in local storage or not
     */
    override userLogin(
        user: IUserData,
        refreshToken?: string,
        keep?: boolean
    ): void {
        // Changed
        const dataChanged =
            !this.authorized ||
            this.userData == null ||
            !Utils.objectEqual(this.userData, user, ['seconds', 'token']);

        // Super call, set token
        super.userLogin(user, refreshToken, keep);

        // Dispatch action
        // Only when unauthorized or with changes except 'token' and 'seconds'
        if (this.userStateDispatch != null && dataChanged)
            this.userStateDispatch({
                type: UserActionType.Login,
                user
            });
    }

    /**
     * User logout
     * @param clearToken Clear refresh token or not
     */
    override userLogout(clearToken: boolean = true): void {
        // Super call
        super.userLogout(clearToken);

        // Dispatch action
        if (this.userStateDispatch != null)
            this.userStateDispatch({
                type: UserActionType.Logout
            });
    }

    /**
     * User unauthorized
     */
    override userUnauthorized() {
        // Super call
        super.userUnauthorized();

        if (this.userStateDispatch != null) {
            // There is delay during state update
            // Not a good idea to try login multiple times with API calls
            this.userStateDispatch({
                type: UserActionType.Unauthorized
            });
        }
    }
}
