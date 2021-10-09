import { IdLabelDto } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import React from 'react';
import { MUGlobal } from './MUGlobal';
import { OptionGroup, OptionGroupProps } from './OptionGroup';

/**
 * Search OptionGroup
 * @param props Props
 * @returns Component
 */
export function SearchOptionGroup<
    T extends Record<string, any> = IdLabelDto,
    D extends DataTypes.IdType = string
>(props: OptionGroupProps<T, D>) {
    // Destruct
    const {
        row = true,
        size = MUGlobal.searchFieldSize,
        sx = { '& .MuiFormLabel-root': { fontSize: '0.75em' } },
        ...rest
    } = props;

    // Layout
    return <OptionGroup<T, D> row={row} size={size} sx={sx} {...rest} />;
}
