import { CoreApp, IAppSettings } from '@etsoo/appscript';

/**
 * React application
 */
export class ReactApp<S extends IAppSettings> extends CoreApp<
    S,
    React.ReactNode
> {}
