import { IAction, ILanguage } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import { IUpdate } from './IState';
import { State } from './State';

/**
 * Language action to manage language and labels
 */
export interface LanguageAction extends ILanguage, IAction {}

/**
 * Language calls with the state
 */
export interface LanguageCalls extends IUpdate<ILanguage, LanguageAction> {
    /**
     * Key value
     * @param key Item key
     */
    get<T extends DataTypes.SimpleType = string>(key: string): T | undefined;
}

// Calls
const calls = {
    /**
     * Key value
     * @param key Item key
     */
    get<T extends DataTypes.SimpleType = string>(key: string) {
        const value = this.state.labels[key];
        if (value == null) return undefined;
        return value as T;
    }
} as LanguageCalls;

/**
 * Language state
 * Creator for language context and provider globally, not inside a component to avoid problem:
 * Cannot update a component (`provider`) while rendering a different component (`Login`)
 */
export class LanguageState {
    /**
     * Context
     */
    readonly context: React.Context<LanguageCalls>;

    /**
     * Provider
     */
    readonly provider: React.FunctionComponent;

    /**
     * Constructor
     */
    constructor(languageItem?: DataTypes.LanguageDefinition) {
        // Default
        const defaultLanguageItem: ILanguage =
            languageItem == null ? ({} as ILanguage) : languageItem;

        // Act
        const { context, provider } = State.create(
            (state: ILanguage, action: LanguageAction) => {
                // Language reducer
                if (state.name !== action.name) {
                    return { ...action };
                }

                return state;
            },
            defaultLanguageItem,
            calls
        );

        this.context = context;
        this.provider = provider;
    }
}
