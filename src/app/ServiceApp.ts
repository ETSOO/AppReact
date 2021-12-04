import {
    createClient,
    IActionResult,
    IApi,
    IApiPayload
} from '@etsoo/appscript';
import { ApiDataError } from '@etsoo/restclient';
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
     * Try login result processing
     * @param result Result
     */
    protected tryLoginResult(result: string | ApiDataError | IActionResult) {}

    /**
     * Try login
     */
    override async tryLogin() {
        // Token
        const token = this.getCacheToken();
        if (token == null || token === '') {
            this.tryLoginResult('');
            return false;
        }

        // Reqest data
        const data: RefreshTokenRQ = {
            timezone: this.getTimeZone()
        };

        // Payload
        const payload: IApiPayload<SmartERPLoginResult, any> = {
            config: { headers: { [CoreConstants.TokenHeaderRefresh]: token } },
            onError: (error) => {
                this.tryLoginResult(error);

                // Prevent further processing
                return false;
            }
        };

        // Call API
        const result = await this.coreApi.put<SmartERPLoginResult>(
            'Auth/RefreshToken',
            data,
            payload
        );
        if (result == null) return false;

        if (!result.ok) {
            this.tryLoginResult(result);
            return false;
        }

        // Token
        const refreshToken = this.getResponseToken(payload.response);
        if (refreshToken == null || result.data == null) {
            this.tryLoginResult(this.get('noData')!);
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
                onError: (error) => {
                    // Set message
                    this.tryLoginResult(error);

                    // Prevent further processing
                    return false;
                }
            }
        );

        if (serviceResult == null) return false;

        if (!serviceResult.ok) {
            this.tryLoginResult(result);
            return false;
        }

        if (serviceResult.data == null) {
            this.tryLoginResult(this.get('noData')!);
            return false;
        }

        this.userLoginEx(serviceResult.data, refreshToken, userData);

        return true;
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
