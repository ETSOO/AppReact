import {
    createClient,
    IApi,
    IApiPayload,
    RefreshTokenProps
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
        const { callback, data, showLoading = false } = props ?? {};

        // Token
        const token = this.getCacheToken();
        if (token == null || token === '') {
            if (callback) callback(false);
            return false;
        }

        // Reqest data
        // Merge additional data passed
        const rq: RefreshTokenRQ = {
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

        // Call API
        const result = await this.coreApi.put<SmartERPLoginResult>(
            'Auth/RefreshToken',
            rq,
            payload
        );
        if (result == null) return false;

        if (!result.ok) {
            if (callback) callback(result);
            return false;
        }

        // Token
        const refreshToken = this.getResponseToken(payload.response);
        if (refreshToken == null || result.data == null) {
            if (callback) callback(this.get('noData')!);
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
                    if (callback) callback(error);

                    // Prevent further processing
                    return false;
                }
            }
        );

        if (serviceResult == null) return false;

        if (!serviceResult.ok) {
            if (callback) callback(serviceResult);
            return false;
        }

        if (serviceResult.data == null) {
            if (callback) callback(this.get('noData')!);
            return false;
        }

        this.userLoginEx(serviceResult.data, refreshToken, userData);

        return true;
    }

    /**
     * Try login
     */
    override async tryLogin() {
        // Reset user state
        const result = await super.tryLogin();
        if (!result) return false;

        // Refresh token
        return await this.refreshToken({
            callback: (_result) => {
                this.toLoginPage();
            }
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
