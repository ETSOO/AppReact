import { IAction, ILanguage } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import { IUpdate } from './IState';
import { State } from './State';

/**
 * Language action to manage language and labels
 */
export interface LanguageAction extends ILanguage, IAction {}

/**
 * Language state
 * Creator for language context and provider globally, not inside a component to avoid problem:
 * Cannot update a component (`provider`) while rendering a different component (`Login`)
 */
export class LanguageState {
    /**
     * Context
     */
    readonly context: React.Context<IUpdate<ILanguage, LanguageAction>>;

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
            languageItem == null
                ? ({} as ILanguage)
                : { name: languageItem.name, labels: languageItem.labels };

        // Act
        const { context, provider } = State.create(
            (state: ILanguage, action: LanguageAction) => {
                // Language reducer
                if (state.name !== action.name) {
                    return { ...action };
                }

                return state;
            },
            defaultLanguageItem
        );

        this.context = context;
        this.provider = provider;
    }
}
