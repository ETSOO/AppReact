import {
    createClient,
    IApi,
    IApiPayload,
    InitCallDto,
    InitCallResult,
    RefreshTokenProps,
    RefreshTokenResult
} from '@etsoo/appscript';
import { DomUtils } from '@etsoo/shared';
import { CoreConstants } from './CoreConstants';
import { IServiceAppSettings } from './IServiceAppSettings';
import { IServicePageData } from './IServicePage';
import { IServiceUser, ServiceLoginResult } from './IServiceUser';
import { ISmartERPUser, SmartERPLoginResult } from './ISmartERPUser';
import { ReactApp } from './ReactApp';
import { RefreshTokenRQ } from './RefreshTokenRQ';

/**
 * Core Service App
 * Service login to core system, get the refesh token and access token
 * Use the acess token to the service api, get a service access token
 * Use the new acess token and refresh token to login
 */
export class ServiceApp<
    P extends IServicePageData = IServicePageData,
    U extends IServiceUser = IServiceUser,
    S extends IServiceAppSettings = IServiceAppSettings
> extends ReactApp<S, U, P> {
    /**
     * Core system API
     */
    readonly coreApi: IApi;

    /**
     * Core system user
     */
    coreUser?: ISmartERPUser;

    /**
     * Constructor
     * @param settings Settings
     * @param name Application name
     */
    constructor(settings: S, name: string) {
        super(settings, name);

        // Check
        if (settings.serviceId == null || settings.coreApi == null) {
            throw new Error('No service settings');
        }

        // Core API
        const api = createClient();
        api.baseUrl = settings.coreApi;

        this.setApi(api);
        this.coreApi = api;
    }

    /**
     * Api init call, connect to the core Api
     * @param data Data
     * @returns Result
     */
    protected override async apiInitCall(data: InitCallDto) {
        return await this.coreApi.put<InitCallResult>(this.initCallApi, data);
    }

    /**
     * Go to the login page
     */
    override toLoginPage() {
        const coreUrl = this.settings.coreUrl;
        window.location.href =
            coreUrl +
            '?serviceId=' +
            this.settings.serviceId +
            '&' +
            DomUtils.Culture +
            '=' +
            this.culture;
    }

    /**
     * Refresh token
     * @param props Props
     */
    override async refreshToken<D = RefreshTokenRQ>(
        props?: RefreshTokenProps<D>
    ) {
        // Destruct
        const {
            callback,
            data,
            relogin = false,
            showLoading = false
        } = props ?? {};

        // Token
        const token = this.getCacheToken();
        if (token == null || token === '') {
            if (callback) callback(false);
            return false;
        }

        // Reqest data
        // Merge additional data passed
        const rq: RefreshTokenRQ = {
            deviceId: this.deviceId,
            timezone: this.getTimeZone(),
            ...data
        };

        // Payload
        const payload: IApiPayload<SmartERPLoginResult, any> = {
            showLoading,
            config: { headers: { [CoreConstants.TokenHeaderRefresh]: token } },
            onError: (error) => {
                if (callback) callback(error);

                // Prevent further processing
                return false;
            }
        };

        // Success callback
        const success = async (
            result: SmartERPLoginResult,
            failCallback?: (result: RefreshTokenResult) => void
        ) => {
            // Token
            const refreshToken = this.getResponseToken(payload.response);
            if (refreshToken == null || result.data == null) {
                if (failCallback) failCallback(this.get('noData')!);
                return false;
            }

            // User data
            const userData = result.data;

            // Use core system access token to service api to exchange service access token
            const serviceResult = await this.api.put<ServiceLoginResult>(
                'Auth/ExchangeToken',
                {
                    token: userData.token
                },
                {
                    showLoading,
                    onError: (error) => {
                        if (failCallback) failCallback(error);

                        // Prevent further processing
                        return false;
                    }
                }
            );

            if (serviceResult == null) return false;

            if (!serviceResult.ok) {
                if (failCallback) failCallback(serviceResult);
                return false;
            }

            if (serviceResult.data == null) {
                if (failCallback) failCallback(this.get('noData')!);
                return false;
            }

            // Login
            this.userLoginEx(serviceResult.data, refreshToken, userData);

            // Success callback
            if (failCallback) failCallback(true);

            return true;
        };

        // Call API
        const result = await this.coreApi.put<SmartERPLoginResult>(
            'Auth/RefreshToken',
            rq,
            payload
        );
        if (result == null) return false;

        if (!result.ok) {
            if (result.type === 'TokenExpired' && relogin) {
                // Try login
                // Dialog to receive password
                var labels = this.getLabels('reloginTip', 'login');
                this.notifier.prompt(
                    labels.reloginTip,
                    async (pwd) => {
                        if (pwd == null) {
                            this.toLoginPage();
                            return;
                        }

                        // Set password for the action
                        rq.pwd = this.encrypt(this.hash(pwd));

                        // Submit again
                        const result = await this.api.put<SmartERPLoginResult>(
                            'Auth/RefreshToken',
                            rq,
                            payload
                        );

                        if (result == null) return;

                        if (result.ok) {
                            await success(
                                result,
                                (loginResult: RefreshTokenResult) => {
                                    if (loginResult === true) {
                                        if (callback) callback(true);
                                        return;
                                    }

                                    const message =
                                        this.formatRefreshTokenResult(
                                            loginResult
                                        );
                                    if (message) this.notifier.alert(message);
                                }
                            );
                            return;
                        }

                        // Popup message
                        this.alertResult(result);
                        return false;
                    },
                    labels.login,
                    { type: 'password' }
                );

                // Fake truth to avoid reloading
                return true;
            }

            if (callback) callback(result);
            return false;
        }

        return await success(result, callback);
    }

    private loginFailed() {
        this.userUnauthorized();
        this.toLoginPage();
    }

    /**
     * Try login
     */
    override async tryLogin<D extends {} = {}>(data?: D) {
        // Reset user state
        const result = await super.tryLogin(data);
        if (!result) return false;

        // Refresh token
        return await this.refreshToken({
            callback: (result) => {
                // Success
                if (result === true) return;

                const message = this.formatRefreshTokenResult(result);
                if (message == null) {
                    this.loginFailed();
                    return;
                }

                this.notifier.alert(message, () => {
                    this.loginFailed();
                });
            },
            data,
            relogin: true
        });
    }

    /**
     * User login extended
     * @param user New user
     * @param refreshToken Refresh token
     * @param coreUser Core system user
     */
    userLoginEx(
        user: IServiceUser,
        refreshToken: string,
        coreUser: ISmartERPUser
    ): void {
        // Service user login
        super.userLogin(user, refreshToken, false);

        // Core system user
        this.coreUser = coreUser;

        // Core system API token
        this.coreApi.authorize(this.settings.authScheme, coreUser.token);
    }
}
