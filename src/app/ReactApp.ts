import { CoreApp, IAppSettings } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import React from 'react';
import { CultureAction } from '../states/CultureState';

/**
 * React application
 */
export abstract class ReactApp<S extends IAppSettings> extends CoreApp<
    S,
    React.ReactNode
> {
    /**
     * Change culture extended
     * @param dispatch Dispatch method
     * @param culture New culture definition
     */
    changeCultureEx(
        dispatch: React.Dispatch<CultureAction>,
        culture: DataTypes.CultureDefinition
    ): void {
        // Dispatch action
        dispatch(culture);

        // Super call
        super.changeCulture(culture);
    }
}
