import { CoreApp, IAppSettings } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import React from 'react';
import { LanguageAction } from '../states/LanguageState';

/**
 * React application
 */
export abstract class ReactApp<S extends IAppSettings> extends CoreApp<
    S,
    React.ReactNode
> {
    /**
     * Change language extended
     * @param dispatch Dispatch method
     * @param language New lnguage definition
     */
    changeLanguageEx(
        dispatch: React.Dispatch<LanguageAction>,
        language: DataTypes.LanguageDefinition
    ): void {
        // Dispatch action
        const action: LanguageAction = language;
        dispatch(action);

        // Super call
        super.changeLanguage(language);
    }
}
