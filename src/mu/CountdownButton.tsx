import React from 'react';
import {
    Button,
    ButtonProps,
    CircularProgress,
    Typography
} from '@material-ui/core';

/**
 * Countdown button action
 */
export interface CountdownButtonAction {
    (): Promise<number>;
}

/**
 * Countdown button props
 */
export type CountdownButtonProps = Omit<ButtonProps, 'endIcon' | 'disabled'> & {
    /**
     * Action, required
     */
    onAction: CountdownButtonAction;
};

/**
 * Countdown button
 * @param props Props
 * @returns Button
 */
export function CountdownButton(props: CountdownButtonProps) {
    // Destructure
    const { onAction, onClick, ...rest } = props;

    // State
    // 0 - normal
    // 1 - loading
    // 2 - countdown
    const [state, updateState] = React.useState(0);

    // Ignore seconds
    const seconds = 2;

    // endIcon
    let endIcon: React.ReactNode;
    if (state === 0) {
        endIcon = undefined;
    } else if (state === 1) {
        endIcon = <CircularProgress />;
    } else {
        const countdown = (state - seconds).toString().padStart(3, '0');
        endIcon = <Typography variant="body2">{countdown}</Typography>;
    }

    // Disabled?
    const disabled = state > 0;

    // Local click
    const localClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Show loading
        updateState(1);

        // Callback
        if (onClick != null) onClick(event);

        // Return any countdown
        onAction().then((result) => {
            if (result > seconds) {
                updateState(result + seconds);

                const seed = setInterval(() => {
                    if (state > seconds) {
                        updateState(state - 1);
                    } else {
                        clearInterval(seed);
                        updateState(0);
                    }
                }, 1000);
            } else {
                updateState(0);
            }
        });
    };

    return (
        <Button
            disabled={disabled}
            endIcon={endIcon}
            onClick={localClick}
            {...rest}
        />
    );
}
