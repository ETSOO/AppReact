import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';
import { MUGlobal } from './MUGlobal';

/**
 * Input field props
 */
export type InputFieldProps = TextFieldProps & {
    /**
     * Change delay (ms) to avoid repeatly dispatch onChange
     */
    changeDelay?: number;

    /**
     * Is the field read only?
     */
    readOnly?: boolean;
};

/**
 * Input field
 * @param props Props
 * @returns Component
 */
export function InputField(props: InputFieldProps) {
    // Destruct
    const {
        changeDelay,
        InputLabelProps = {},
        InputProps = {},
        onChange,
        readOnly,
        size = MUGlobal.inputFieldSize,
        variant = MUGlobal.inputFieldVariant,
        ...rest
    } = props;

    // Shrink
    InputLabelProps.shrink = MUGlobal.searchFieldShrink;

    // Read only
    if (readOnly != null) InputProps.readOnly = readOnly;

    const isMounted = React.useRef(true);
    const delaySeed = React.useRef(0);

    const onChangeEx = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (onChange == null) return;

        if (changeDelay == null || changeDelay < 1) {
            onChange(event);
            return;
        }

        if (delaySeed.current > 0) window.clearTimeout(delaySeed.current);
        delaySeed.current = window.setTimeout(() => {
            if (isMounted.current) onChange(event);
        }, changeDelay);
    };

    React.useEffect(() => {
        return () => {
            isMounted.current = false;
            window.clearTimeout(delaySeed.current);
        };
    }, []);

    // Layout
    return (
        <TextField
            InputLabelProps={InputLabelProps}
            InputProps={InputProps}
            onChange={onChangeEx}
            size={size}
            variant={variant}
            {...rest}
        />
    );
}
