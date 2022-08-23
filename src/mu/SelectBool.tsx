import { DataTypes, Utils } from '@etsoo/shared';
import React from 'react';
import { globalApp } from '..';
import { SelectEx, SelectExProps } from './SelectEx';

/**
 * SelectBool props
 */
export interface SelectBoolProps
    extends Omit<
        SelectExProps<DataTypes.IdLabelItem<string>>,
        'options' | 'loadData'
    > {}

/**
 * SelectBool (yes/no)
 * @param props Props
 * @returns Component
 */
export function SelectBool(props: SelectBoolProps) {
    // Destruct
    const { search = true, autoAddBlankItem = search, ...rest } = props;

    // Options
    const options: DataTypes.IdLabelItem<string>[] = [
        { id: 'false', label: globalApp.get('no')! },
        { id: 'true', label: globalApp.get('yes')! }
    ];

    if (autoAddBlankItem) Utils.addBlankItem(options);

    // Layout
    return (
        <SelectEx<DataTypes.IdLabelItem<string>>
            options={options}
            search={search}
            {...rest}
        />
    );
}
