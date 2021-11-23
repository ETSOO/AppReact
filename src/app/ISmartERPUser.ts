import { IActionResult, IUser } from '@etsoo/appscript';

/**
 * SmartERP user interface
 */
export interface ISmartERPUser extends IUser {}

/**
 * SmartERP user login result
 */
export type SmartERPLoginResult = IActionResult<ISmartERPUser>;
