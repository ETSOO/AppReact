import React from 'react';
import {
    IconButton,
    InputAdornment,
    TextField,
    TextFieldProps
} from '@mui/material';
import { MUGlobal } from './MUGlobal';
import { Clear, Visibility } from '@mui/icons-material';
import useCombinedRefs from '../uses/useCombinedRefs';

/**
 * Extended text field props
 */
export type TextFieldExProps = TextFieldProps & {
    /**
     * Change delay (ms) to avoid repeatly dispatch onChange
     */
    changeDelay?: number;

    /**
     * On enter click
     */
    onEnter?: React.KeyboardEventHandler<HTMLDivElement>;

    /**
     * Is the field read only?
     */
    readOnly?: boolean;

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
        changeDelay,
        error,
        fullWidth = true,
        helperText,
        InputProps = {},
        onChange,
        onKeyPress,
        onEnter,
        inputRef,
        readOnly,
        showClear,
        showPassword,
        type,
        variant = MUGlobal.textFieldVariant,
        ...rest
    } = props;

    // State
    const [errorText, updateErrorText] = React.useState<React.ReactNode>();
    const [empty, updateEmpty] = React.useState<boolean>(true);

    // Read only
    if (readOnly != null) InputProps.readOnly = readOnly;

    // Calculate
    let errorEx = error;
    let helperTextEx = helperText;
    if (errorText != null) {
        errorEx = true;
        helperTextEx = errorText;
    }

    let typeEx = showPassword ? 'password' : type;

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

    const preventDefault = (e: React.TouchEvent | React.MouseEvent) => {
        // Prevent long press
        if (e.isPropagationStopped()) e.stopPropagation();

        if (e.isDefaultPrevented()) e.preventDefault();
    };

    const touchStart = (e: React.TouchEvent | React.MouseEvent) => {
        // Show the password
        if (input) {
            input.blur();
            input.type = 'text';
        }
        preventDefault(e);
    };

    const touchEnd = (e: React.TouchEvent | React.MouseEvent) => {
        // Show the password
        if (input) input.type = 'password';
        preventDefault(e);
    };

    // Show password and/or clear button
    if (!empty && (showPassword || showClear)) {
        InputProps.endAdornment = (
            <InputAdornment position="end">
                {showPassword && (
                    <IconButton
                        tabIndex={-1}
                        onContextMenu={(event) => event.preventDefault()}
                        onMouseDown={touchStart}
                        onMouseUp={touchEnd}
                        onTouchStart={touchStart}
                        onTouchCancel={touchEnd}
                        onTouchEnd={touchEnd}
                    >
                        <Visibility />
                    </IconButton>
                )}
                {showClear && (
                    <IconButton onClick={clearClick} tabIndex={-1}>
                        <Clear />
                    </IconButton>
                )}
            </InputAdornment>
        );
    }

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

    React.useImperativeHandle(
        ref,
        () => ({
            /**
             * Set error
             * @param error Error
             */
            setError(error: React.ReactNode): void {
                updateErrorText(error);
            }
        }),
        []
    );

    const isMounted = React.useRef(true);
    const delaySeed = React.useRef(0);

    const onChangeEx = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (errorText != null) {
            // Reset
            updateErrorText(undefined);
        }

        if (showClear || showPassword) {
            if (event.target.value === '') {
                updateEmpty(true);
            } else if (empty) {
                updateEmpty(false);
            }
        }

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
