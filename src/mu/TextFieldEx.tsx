import React from 'react';
import { TextField, TextFieldProps } from '@material-ui/core';
import { MUGlobal } from './MUGlobal';

/**
 * Extended text field props
 */
export type TextFieldExProps = TextFieldProps & {
    /**
     * On enter click
     */
    onEnter?: React.KeyboardEventHandler<HTMLDivElement>;
};

/**
 * Extended text field methods
 */
export interface TextFieldExMethods {
    /**
     * Set error
     * @param error Error
     */
    setError(error: React.ReactNode): void;
}

export const TextFieldEx = React.forwardRef<
    TextFieldExMethods,
    TextFieldExProps
>((props, ref) => {
    // Destructure
    const {
        error,
        fullWidth = true,
        helperText,
        onChange,
        onKeyPress,
        onEnter,
        variant = MUGlobal.textFieldVariant,
        ...rest
    } = props;

    // State
    const [errorText, updateErrorText] = React.useState<React.ReactNode>();

    // Calculate
    let errorEx = error;
    let helperTextEx = helperText;
    if (errorText != null) {
        errorEx = true;
        helperTextEx = errorText;
    }

    // Extend change
    const onChangeEx = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (errorText != null) {
            // Reset
            updateErrorText(undefined);
        }

        if (onChange != null) {
            onChange(e);
        }
    };

    // Extend key precess
    const onKeyPressEx =
        onEnter == null
            ? onKeyPress
            : (e: React.KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === 'Enter') {
                      // Enter press callback
                      onEnter(e);
                  }

                  if (!e.isDefaultPrevented && onKeyPress != null) {
                      // Common press callback
                      onKeyPress(e);
                  }
              };

    React.useImperativeHandle(ref, () => ({
        /**
         * Set error
         * @param error Error
         */
        setError(error: React.ReactNode): void {
            updateErrorText(error);
        }
    }));

    // Textfield
    return (
        <TextField
            error={errorEx}
            fullWidth={fullWidth}
            helperText={helperTextEx}
            onChange={onChangeEx}
            onKeyPress={onKeyPressEx}
            variant={variant}
            {...rest}
        />
    );
});
