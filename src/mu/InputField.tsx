import { TextField, TextFieldProps } from '@material-ui/core';
import React from 'react';
import { MUGlobal } from './MUGlobal';

/**
 * Input field
 * @param props Props
 * @returns Component
 */
export function InputField(props: TextFieldProps) {
    // Destruct
    const {
        InputLabelProps = {},
        size = MUGlobal.inputFieldSize,
        variant = MUGlobal.inputFieldVariant,
        ...rest
    } = props;

    // Shrink
    InputLabelProps.shrink = MUGlobal.searchFieldShrink;

    // Layout
    return (
        <TextField
            InputLabelProps={InputLabelProps}
            size={size}
            variant={variant}
            {...rest}
        />
    );
}
