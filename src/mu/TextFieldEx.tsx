import React from 'react';
import { TextField, TextFieldProps } from '@material-ui/core';

/**
 * Extended text field props
 */
export type TextFieldExProps = TextFieldProps & {
    /**
     * Error text
     */
    errorText?: React.ReactNode;

    /**
     * On enter click
     */
    onEnter?: React.KeyboardEventHandler<HTMLDivElement>;
};

/**
 * Extended text field
 * @param props Props
 * @returns component
 */
export function TextFieldEx(props: TextFieldExProps) {
    // Destructure
    const {
        error,
        errorText,
        fullWidth = true,
        helperText,
        onChange,
        onKeyPress,
        onEnter,
        variant = 'standard',
        ...rest
    } = props;

    // States
    const [errorTextEx, updateErrorText] = React.useState<React.ReactNode>(
        errorText
    );

    // Detect error text change
    // React.useState keep the reference for one time, even with property change and rerender
    React.useEffect(() => {
        updateErrorText(errorText);
    }, [errorText, errorTextEx == errorText]);

    console.log(errorText, errorTextEx);

    // Calculate
    let errorEx: boolean | undefined;
    let helperTextEx: React.ReactNode;
    if (errorTextEx != null) {
        errorEx = true;
        helperTextEx = errorTextEx;
    } else {
        errorEx = error;
        helperTextEx = helperText;
    }

    // Extend change
    const onChangeEx = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Reset
        updateErrorText(undefined);

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
}
