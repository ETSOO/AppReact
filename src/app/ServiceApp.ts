import {
    createClient,
    IApi,
    IApiPayload,
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
     * Service API
     */
    readonly serviceApi: IApi;

    private _serviceUser?: IServiceUser;
    /**
     * Service user
     */
    get serviceUser() {
        return this._serviceUser;
    }
    protected set serviceUser(value: IServiceUser | undefined) {
        this._serviceUser = value;
    }

    /**
     * Service passphrase
     */
    protected servicePassphrase: string = '';

    /**
     * Constructor
     * @param settings Settings
     * @param name Application name
     */
    constructor(settings: S, name: string) {
        super(settings, name);

        // Check
        if (settings.serviceId == null || settings.serviceEndpoint == null) {
            throw new Error('No service settings');
        }

        // Service API
        const api = createClient();
        api.baseUrl = settings.serviceEndpoint;

        this.setApi(api);
        this.serviceApi = api;
    }

    /**
     * Go to the login page
     */
    override toLoginPage() {
        const coreUrl = this.settings.webUrl;
        window.location.href =
            coreUrl +
            '?serviceId=' +
            this.settings.serviceId +
            '&serviceDeviceId=' +
            this.deviceId +
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
            const serviceResult = await this.serviceApi.put<ServiceLoginResult>(
                'Auth/ExchangeToken',
                {
                    token: this.encryptEnhanced(
                        userData.token,
                        this.settings.serviceId.toString()
                    )
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
            this.userLoginEx(userData, refreshToken, serviceResult.data);

            // Success callback
            if (failCallback) failCallback(true);

            return true;
        };

        // Call API
        const result = await this.api.put<SmartERPLoginResult>(
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
     * Service decrypt message
     * @param messageEncrypted Encrypted message
     * @param passphrase Secret passphrase
     * @returns Pure text
     */
    serviceDecrypt(messageEncrypted: string, passphrase?: string) {
        return this.decrypt(
            messageEncrypted,
            passphrase ?? this.servicePassphrase
        );
    }

    /**
     * Service encrypt message
     * @param message Message
     * @param passphrase Secret passphrase
     * @param iterations Iterations, 1000 times, 1 - 99
     * @returns Result
     */
    serviceEncrypt(message: string, passphrase?: string, iterations?: number) {
        return this.encrypt(
            message,
            passphrase ?? this.servicePassphrase,
            iterations
        );
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
     * @param user Core system user
     * @param refreshToken Refresh token
     * @param serviceUser Service user
     */
    userLoginEx(
        user: ISmartERPUser,
        refreshToken: string,
        serviceUser: IServiceUser
    ): void {
        // Service user login
        this.servicePassphrase =
            this.decrypt(
                serviceUser.serviceDeviceId,
                this.settings.serviceId.toString()
            ) ?? '';

        // Keep = true, means service could hold the refresh token for long access
        super.userLogin(user, refreshToken, true);

        // Service user
        this.serviceUser = serviceUser;

        // Service API token
        this.serviceApi.authorize(this.settings.authScheme, serviceUser.token);
    }
}
