import { createClient, IApi, IUser } from '@etsoo/appscript';
import { IPageData } from '../states/PageState';
import { IServiceAppSettings } from './IServiceAppSettings';
import { ReactApp } from './ReactApp';

/**
 * Core Service App
 * Service login to core system, get the refesh token and access token
 * Use the acess token to the service api, get a service access token
 * Use the new acess token and refresh token to login
 */
export class ServiceApp<
    P extends IPageData,
    U extends IUser,
    S extends IServiceAppSettings = IServiceAppSettings
> extends ReactApp<S, U, P> {
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
}
