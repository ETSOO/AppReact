import React from 'react';
import { MUGlobal } from './MUGlobal';
import { OptionGroup, OptionGroupProps } from './OptionGroup';

/**
 * Search OptionGroup
 * @param props Props
 * @returns Component
 */
export function SearchOptionGroup<T = any>(props: OptionGroupProps<T>) {
    // Destruct
    const {
        row = true,
        size = MUGlobal.searchFieldSize,
        sx = { '& .MuiFormLabel-root': { fontSize: '0.75em' } },
        ...rest
    } = props;

    // Layout
    return <OptionGroup<T> row={row} size={size} sx={sx} {...rest} />;
}
