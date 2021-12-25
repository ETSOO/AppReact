import {
    CoreApp,
    createClient,
    IAppSettings,
    ICoreApp,
    IUser,
    IUserData
} from '@etsoo/appscript';
import { NotificationRenderProps } from '@etsoo/notificationbase';
import {
    DataTypes,
    DomUtils,
    StorageUtils,
    WindowStorage
} from '@etsoo/shared';
import React from 'react';
import { NotifierMU } from '../mu/NotifierMU';
import { ProgressCount } from '../mu/ProgressCount';
import { NotificationReactCallProps } from '../notifier/Notifier';
import { CultureAction, CultureState } from '../states/CultureState';
import { IStateProps } from '../states/IState';
import {
    IPageData,
    PageAction,
    PageActionType,
    PageState
} from '../states/PageState';
import {
    UserAction,
    UserActionType,
    UserCalls,
    UserState
} from '../states/UserState';
import { InputDialogProps } from './InputDialogProps';
import { Labels } from './Labels';

// Global application
let globalApp: IReactApp<IAppSettings, any, IPageData>;

/**
 * React app state detector
 * Case 1: undefined, when refresh the whole page
 * Case 2: false, unauthorized
 * Case 3: true, authorized or considered as authorized (maynot, like token expiry)
 * Case 4: property or properties changed
 * @param props Props
 * @returns Component
 */
export function ReactAppStateDetector(props: IStateProps) {
    // Destruct
    const { targetFields, update } = props;

    // Context
    const { state } =
        globalApp == null
            ? ({ state: {} } as UserCalls<IUser>)
            : React.useContext(
                  (globalApp.userState as UserState<IUser>).context
              );

    // Ready
    React.useEffect(() => {
        // Match fields
        const changedFields = state.lastChangedFields;
        let matchedFields: string[] | undefined;
        if (targetFields == null || changedFields == null) {
            matchedFields = changedFields;
        } else {
            matchedFields = [];
            targetFields.forEach((targetField) => {
                if (changedFields.includes(targetField))
                    matchedFields?.push(targetField);
            });
        }

        // Callback
        update(state.authorized, matchedFields);
    }, [state]);

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
export class ReactApp<
        S extends IAppSettings,
        D extends IUser,
        P extends IPageData
    >
    extends CoreApp<S, React.ReactNode, NotificationReactCallProps>
    implements IReactApp<S, D, P>
{
    private static _notifierProvider: React.FunctionComponent<NotificationRenderProps>;

    /**
     * Get notifier provider
     */
    static get notifierProvider() {
        return this._notifierProvider;
    }

    private static createApi(settings: IAppSettings) {
        // API
        // Support to replace {hostname} with current hostname
        const api = createClient();
        api.baseUrl = settings.endpoint;
        return api;
    }

    private static createNotifier() {
        // Notifier
        ReactApp._notifierProvider = NotifierMU.setup();

        return NotifierMU.instance;
    }

    /**
     * Culture state
     */
    readonly cultureState: CultureState;

    /**
     * Page state
     */
    readonly pageState: PageState<P>;

    /**
     * User state
     */
    readonly userState = new UserState<D>();

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
     * Constructor
     * @param settings Settings
     * @param name Application name
     * @param globalFields Global fields
     */
    constructor(settings: S, name: string, globalFields: string[]) {
        super(
            settings,
            ReactApp.createApi(settings),
            ReactApp.createNotifier(),
            new WindowStorage(
                [
                    ...globalFields,

                    DomUtils.CountryField,
                    DomUtils.CultureField,

                    CoreApp.deviceIdField,
                    CoreApp.headerTokenField,
                    CoreApp.serversideDeviceIdField
                ],
                (field, data, index) => {
                    if (index > 0 && field === CoreApp.headerTokenField) {
                        // Clear passphrase to regenerate the device id
                        StorageUtils.setSessionData(
                            CoreApp.devicePassphraseField,
                            undefined
                        );

                        console.log(
                            'devicePassphraseField',
                            index,
                            StorageUtils.getSessionData(
                                CoreApp.devicePassphraseField
                            )
                        );

                        // Clear token
                        return null;
                    }
                    return data;
                }
            ),
            name
        );
        this.cultureState = new CultureState(settings.currentCulture);
        this.pageState = new PageState<P>();

        globalApp = this;
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
            undefined,
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
     * @param dispatch User state dispatch
     */
    override userLogin(
        user: IUserData,
        refreshToken: string,
        keep?: boolean,
        dispatch?: boolean
    ): void {
        // Super call, set token
        super.userLogin(user, refreshToken, keep);

        // Dispatch action
        if (this.userStateDispatch != null && dispatch !== false)
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
