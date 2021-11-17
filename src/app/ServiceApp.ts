import { createClient, IApi, IAppSettings, IUser } from '@etsoo/appscript';
import { IPageData } from '../states/PageState';
import { ReactApp } from './ReactApp';

/**
 * Core Service App
 * Service login to core system, get the refesh token and access token
 * Use the acess token to the service api, get a service access token
 * Use the new acess token and refresh token to login
 */
export class ServiceApp<
    S extends IAppSettings,
    U extends IUser,
    P extends IPageData
> extends ReactApp<S, U, P> {
    // Create core api
    private static createCoreApi(settings: IAppSettings) {
        // Check
        if (settings.serviceId == null || settings.coreApi == null) {
            throw new Error('No service settings');
        }

        // Core API
        const api = createClient();
        api.baseUrl = settings.coreApi;

        return api;
    }

    /**
     * Core system API
     */
    readonly coreApi: IApi;

    /**
     * Constructor
     * @param settings Settings
     * @param name Application name
     */
    constructor(settings: S, name: string) {
        super(settings, name);

        this.coreApi = ServiceApp.createCoreApi(settings);
        this.setApi(this.coreApi);
    }
}
