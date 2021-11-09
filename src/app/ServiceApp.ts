import { IAppSettings, IUser } from '@etsoo/appscript';
import { IPageData } from '../states/PageState';
import { ReactApp } from './ReactApp';

/**
 * Core Service App
 */
export class ServiceApp<
    S extends IAppSettings,
    U extends IUser,
    P extends IPageData
> extends ReactApp<S, U, P> {}
