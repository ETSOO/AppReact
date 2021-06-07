import { IAction, ICulture } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import { IProviderProps, IUpdate } from './IState';
import { State } from './State';

/**
 * Culture action to manage resources
 */
export interface CultureAction extends ICulture, IAction {}

/**
 * Culture calls with the state
 */
export interface CultureCalls extends IUpdate<ICulture, CultureAction> {
    /**
     * Key value
     * @param key Item key
     */
    get<T extends DataTypes.SimpleType = string>(key: string): T | undefined;
}

/**
 * Culture provider props
 */
export type CultureProviderProps = IProviderProps<ICulture, CultureAction>;

// Calls
const calls = {
    /**
     * Key value
     * @param key Item key
     */
    get<T extends DataTypes.SimpleType = string>(key: string) {
        const value = this.state.resources[key];
        if (value == null) return undefined;
        return value as T;
    }
} as CultureCalls;

/**
 * Culture state
 * Creator for culture context and provider globally, not inside a component to avoid problem:
 * Cannot update a component (`provider`) while rendering a different component
 */
export class CultureState {
    /**
     * Context
     */
    readonly context: React.Context<CultureCalls>;

    /**
     * Provider
     */
    readonly provider: React.FunctionComponent<CultureProviderProps>;

    /**
     * Constructor
     */
    constructor(item?: DataTypes.CultureDefinition) {
        // Default
        const defaultItem: ICulture = item ?? ({} as ICulture);

        // Act
        const { context, provider } = State.create(
            (state: ICulture, action: CultureAction) => {
                // Language reducer
                if (state.name !== action.name) {
                    return { ...action };
                }

                return state;
            },
            defaultItem,
            calls
        );

        this.context = context;
        this.provider = provider;
    }
}
