import { ListType1, Utils } from '@etsoo/shared';
import React from 'react';
import { globalApp } from '..';
import { SelectEx, SelectExProps } from './SelectEx';

/**
 * SelectBool props
 */
export type SelectBoolProps = Omit<
    SelectExProps<ListType1>,
    'options' | 'loadData'
>;

/**
 * SelectBool (yes/no)
 * @param props Props
 * @returns Component
 */
export function SelectBool(props: SelectBoolProps) {
    // Destruct
    const { search = true, autoAddBlankItem = search, ...rest } = props;

    // Options
    const options: ListType1[] = [
        { id: 'false', label: globalApp.get('no')! },
        { id: 'true', label: globalApp.get('yes')! }
    ];

    if (autoAddBlankItem) Utils.addBlankItem(options);

    // Layout
    return <SelectEx<ListType1> options={options} search={search} {...rest} />;
}
