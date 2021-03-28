import { IAction, IUser, IUserData } from "@etsoo/appscript";
import { State } from "./State";

/**
 * User action type
 * Style like 'const enum' will remove definition of the enum and cause module errors
 */
 export enum UserActionType {
    // Login action
    Login = 'LOGIN',

    // Logout action
    Logout = 'LOGOUT',

    // Update action
    Update = 'UPDATE'
}

/**
 * User update interface
 */
export interface IUserUpdate {
    /**
     * Callback function do update the state
     */
    <D extends IUser>(state: D): void;
}

/**
 * User action to manage the user
 */
 export interface UserAction extends IAction {
    /**
     * Action type
     */
    type: UserActionType;

    /**
     * User data
     */
    user?: IUserData;

    /**
     * User update callback
     */
    update?: IUserUpdate;
}

/**
 * User state
 */
export class UserState {
    /**
     * Create user state
     * @returns User context and provider
     */
    public static create<D extends IUser>() {
        return State.create((
            state: D, action: UserAction
        ) => {
            // User reducer
            switch (action.type) {
                case UserActionType.Login:
                    return { ...action.user!, authorized: true } as D;
                case UserActionType.Logout:
                    return { ...state, authorized: false };
                case UserActionType.Update:
                    if(action.update) {
                        var newState = { ... state };
                        action.update(newState);
                        return newState;
                    }
                    return state;
                default:
                    return state;
            }
        }, {} as D);
    }
}