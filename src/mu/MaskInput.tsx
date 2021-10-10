import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';
import { MUGlobal } from './MUGlobal';
import { useIMask } from 'react-imask';

/**
 * Mask input props
 */
export type MaskInputProps = TextFieldProps & {
    /**
     * Mask props
     */
    mask: IMask.AnyMaskedOptions;

    /**
     * Is the field read only?
     */
    readOnly?: boolean;

    /**
     * Search case
     */
    search?: boolean;
};

/**
 * Mask input
 * https://imask.js.org/
 * @param props Props
 * @returns Component
 */
export function MaskInput(props: MaskInputProps) {
    // Destruct
    const {
        mask,
        InputLabelProps = {},
        InputProps = {},
        readOnly,
        search = false,
        size = search ? MUGlobal.searchFieldSize : MUGlobal.inputFieldSize,
        variant = search
            ? MUGlobal.searchFieldVariant
            : MUGlobal.inputFieldVariant,
        ...rest
    } = props;

    const { ref } = useIMask(mask);

    // Shrink
    InputLabelProps.shrink = search
        ? MUGlobal.searchFieldShrink
        : MUGlobal.inputFieldShrink;

    // Read only
    if (readOnly != null) InputProps.readOnly = readOnly;
    InputProps.inputRef = ref;

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
