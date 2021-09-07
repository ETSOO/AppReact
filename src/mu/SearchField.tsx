import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';
import { MUGlobal } from './MUGlobal';

/**
 * Search field props
 */
export type SearchFieldProps = TextFieldProps & {
    /**
     * Is the field read only?
     */
    readOnly?: boolean;
};

/**
 * Search field
 * @param props Props
 * @returns Component
 */
export function SearchField(props: SearchFieldProps) {
    // Destruct
    const {
        InputLabelProps = {},
        InputProps = {},
        readOnly,
        size = MUGlobal.searchFieldSize,
        variant = MUGlobal.searchFieldVariant,
        ...rest
    } = props;

    // Shrink
    InputLabelProps.shrink = MUGlobal.searchFieldShrink;

    // Read only
    if (readOnly != null) InputProps.readOnly = readOnly;

    // Layout
    return (
        <TextField
            InputLabelProps={InputLabelProps}
            InputProps={InputProps}
            size={size}
            variant={variant}
            {...rest}
        />
    );
}
