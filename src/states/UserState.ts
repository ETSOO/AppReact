import { IAction, IUser, IUserData } from '@etsoo/appscript';
import { IProviderProps, IUpdate } from './IState';
import { State } from './State';

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
    readonly context: React.Context<UserCalls<D>>;

    /**
     * Provider
     */
    readonly provider: React.FunctionComponent<UserProviderProps<D>>;

    /**
     * Constructor
     */
    constructor() {
        const { context, provider } = State.create(
            (state: D, action: UserAction<D>) => {
                // User reducer
                switch (action.type) {
                    case UserActionType.Login:
                        return { ...action.user!, authorized: true } as D;
                    case UserActionType.Logout:
                        return {
                            ...state, // Keep other user data
                            token: undefined, // Remove token
                            authorized: false // Flag as authorized
                        };
                    case UserActionType.Update:
                        if (action.update) {
                            var newState = { ...state };
                            action.update(newState);
                            return newState;
                        }
                        return state;
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
}
