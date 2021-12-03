import { createClient, IApi } from '@etsoo/appscript';
import { DomUtils } from '@etsoo/shared';
import { ISmartERPUser } from '..';
import { IServiceAppSettings } from './IServiceAppSettings';
import { IServicePageData } from './IServicePage';
import { IServiceUser } from './IServiceUser';
import { ReactApp } from './ReactApp';

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
        const coreUrl = this.settings.coreApi;
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
