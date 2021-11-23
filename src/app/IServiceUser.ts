import { IActionResult, IUser } from '@etsoo/appscript';

/**
 * Service user interface
 */
export interface IServiceUser extends IUser {}

/**
 * Service user login result
 */
export type ServiceLoginResult = IActionResult<IServiceUser>;
