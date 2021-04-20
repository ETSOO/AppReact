import React from 'react';
import {
    IconButton,
    InputAdornment,
    TextField,
    TextFieldProps
} from '@material-ui/core';
import { MUGlobal } from './MUGlobal';
import { Clear, Visibility } from '@material-ui/icons';
import useCombinedRefs from '../uses/useCombinedRefs';

/**
 * Extended text field props
 */
export type TextFieldExProps = TextFieldProps & {
    /**
     * On enter click
     */
    onEnter?: React.KeyboardEventHandler<HTMLDivElement>;

    /**
     * Show clear button
     */
    showClear?: boolean;

    /**
     * Show password button
     */
    showPassword?: boolean;
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
        InputProps = {},
        onChange,
        onKeyPress,
        onEnter,
        inputRef,
        showClear,
        showPassword,
        type,
        variant = MUGlobal.textFieldVariant,
        ...rest
    } = props;

    // State
    const [errorText, updateErrorText] = React.useState<React.ReactNode>();
    const [passwordVisible, updatePasswordVisible] = React.useState<boolean>();
    const [empty, updateEmpty] = React.useState<boolean>(true);

    // Calculate
    let errorEx = error;
    let helperTextEx = helperText;
    if (errorText != null) {
        errorEx = true;
        helperTextEx = errorText;
    }

    let typeEx = type;
    if (showPassword) {
        typeEx = passwordVisible ? 'text' : 'password';
    }

    let input: HTMLInputElement | undefined;
    const localRef = (ref: HTMLInputElement) => {
        input = ref;

        if (input.value !== '') {
            updateEmpty(false);
        }
    };

    const clearClick = () => {
        if (input != null) {
            input.value = '';
            input.focus();
        }

        if (errorText != null) {
            // Reset
            updateErrorText(undefined);
        }

        updateEmpty(true);
    };

    const touchStart = (e: React.TouchEvent) => {
        // Avoid focus case selecting all text
        input?.blur();

        // Show the password
        updatePasswordVisible(true);
    };

    // Show password and/or clear button
    if (!empty && (showPassword || showClear)) {
        InputProps.endAdornment = (
            <InputAdornment position="end">
                {showPassword && (
                    <IconButton
                        onMouseDown={() => updatePasswordVisible(true)}
                        onMouseUp={() => updatePasswordVisible(false)}
                        onTouchStart={touchStart}
                        onTouchCancel={() => updatePasswordVisible(false)}
                        onTouchEnd={() => updatePasswordVisible(false)}
                    >
                        <Visibility />
                    </IconButton>
                )}
                {showClear && (
                    <IconButton onClick={clearClick}>
                        <Clear />
                    </IconButton>
                )}
            </InputAdornment>
        );
    }

    // Extend change
    const onChangeEx = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (errorText != null) {
            // Reset
            updateErrorText(undefined);
        }

        if (showClear || showPassword) {
            if (e.target.value === '') {
                updateEmpty(true);
            } else if (empty) {
                updateEmpty(false);
            }
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
            inputRef={useCombinedRefs(inputRef, localRef)}
            InputProps={InputProps}
            onChange={onChangeEx}
            onKeyPress={onKeyPressEx}
            type={typeEx}
            variant={variant}
            {...rest}
        />
    );
});
