import { IdLabelDto } from '@etsoo/appscript';
import React from 'react';
import { globalApp } from '..';
import { SelectEx, SelectExProps } from './SelectEx';

/**
 * SelectBool props
 */
export interface SelectBoolProps
    extends Omit<SelectExProps<IdLabelDto<string>>, 'options' | 'loadData'> {}

/**
 * SelectBool (yes/no)
 * @param props Props
 * @returns Component
 */
export function SelectBool(props: SelectBoolProps) {
    // Destruct
    const { search = true, ...rest } = props;

    // Options
    const options: IdLabelDto<string>[] = [
        { id: 'false', label: globalApp.get('no')! },
        { id: 'true', label: globalApp.get('yes')! }
    ];

    if (search) options.unshift({ id: '', label: '---' });

    // Layout
    return <SelectEx options={options} search={search} {...rest} />;
}
