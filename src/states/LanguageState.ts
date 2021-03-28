import { IAction, ILanguage } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import { State } from './State';

/**
 * Language action to manage language and labels
 */
export interface LanguageAction extends ILanguage, IAction {
}

/**
 * Language state
 */
export class LanguageState {
    /**
     * Creator for language context and provider globally, not inside a component to avoid problem:
     * Cannot update a component (`provider`) while rendering a different component (`Login`)
     * @param languageItem Initial language item
     */
    public static create(languageItem?: DataTypes.LanguageDefinition) {
        // Default
        const defaultLanguageItem: ILanguage =
            languageItem == null
                ? ({} as ILanguage)
                : { name: languageItem.name, labels: languageItem.labels };

        // Act
        return State.create((
            state: ILanguage,
            action: LanguageAction
        ) => {
            // Language reducer
            if (state.name !== action.name) {
                return { ...action };
            }
    
            return state;
        }, defaultLanguageItem);
    }
}