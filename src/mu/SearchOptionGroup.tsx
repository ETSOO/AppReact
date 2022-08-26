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
    T extends object = DataTypes.IdLabelItem,
    D extends DataTypes.Keys<T> = DataTypes.Keys<T>
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
