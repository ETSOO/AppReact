import { IAction, IUser, IUserData, UserKey } from '@etsoo/appscript';
import { Utils } from '@etsoo/shared';
import { IProviderProps, IUpdate } from './IState';
import { State } from './State';

/**
 * User action type
 * Style like 'const enum' will remove definition of the enum and cause module errors
 */
export enum UserActionType {
    // Login
    Login = 'LOGIN',

    // Logout
    Logout = 'LOGOUT',

    // Update
    Update = 'UPDATE',

    // Unauthorized
    Unauthorized = 'UNAUTHORIZED'
}

/**
 * User action to manage the user
 */
export interface UserAction<D extends IUser> extends IAction {
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
    update?: (state: D) => void;
}

/**
 * User provider props
 */
export type UserProviderProps<D extends IUser> = IProviderProps<UserAction<D>>;

/**
 * Users calls with the state
 */
export interface UserCalls<D extends IUser> extends IUpdate<D, UserAction<D>> {}

/**
 * User state
 */
export class UserState<D extends IUser> {
    /**
     * Context
     */
    readonly context;

    /**
     * Provider
     */
    readonly provider;

    /**
     * Constructor
     */
    constructor() {
        const { context, provider } = State.create(
            (state: D, action: UserAction<D>) => {
                // User reducer
                switch (action.type) {
                    case UserActionType.Login:
                        const lastChangedFields =
                            state.authorized && action.user
                                ? this.getChangedFields(action.user, state)
                                : undefined;
                        return {
                            ...action.user!,
                            authorized: true,
                            lastChangedFields
                        } as D;
                    case UserActionType.Logout:
                        return {
                            ...state, // Keep other user data
                            lastChangedFields: undefined,
                            token: undefined, // Remove token
                            authorized: false // Flag as unauthorized
                        };
                    case UserActionType.Update:
                        if (action.update) {
                            var newState = { ...state };
                            action.update(newState);
                            newState.lastChangedFields = this.getChangedFields(
                                newState,
                                state
                            );
                            return newState;
                        }
                        return state;
                    case UserActionType.Unauthorized:
                        // Avoid multiple updates (For example, multiple API calls failed with 405)
                        if (state.authorized === false) return state;

                        return {
                            ...state, // Keep other user data and token for refresh
                            lastChangedFields: undefined,
                            authorized: false // Flag as unauthorized
                        };
                    default:
                        return state;
                }
            },
            {} as D,
            {} as UserCalls<D>
        );

        this.context = context;
        this.provider = provider;
    }

    private getChangedFields(input: {}, init: {}) {
        return Utils.objectUpdated(input, init, [
            'authorized',
            'seconds',
            'lastChangedFields'
        ]) as UserKey[];
    }
}
