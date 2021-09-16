import {
    Button,
    ButtonProps,
    CircularProgress,
    CircularProgressProps
} from '@mui/material';
import React from 'react';

/**
 * Loading button props
 */
export type LoadingButtonProps = ButtonProps & {
    /**
     * Loading icon props
     */
    loadingIconProps?: CircularProgressProps;
};

/**
 * Loading button
 * @param props Props
 */
export function LoadingButton(props: LoadingButtonProps) {
    // Destruct
    const { endIcon, loadingIconProps = {}, onClick, ...rest } = props;

    // Default size
    loadingIconProps.size ??= 12;

    // State
    // https://stackoverflow.com/questions/55265255/react-usestate-hook-event-handler-using-initial-state
    const [loading, setLoading] = React.useState(false);

    // Icon
    const localEndIcon = loading ? (
        <CircularProgress {...loadingIconProps} />
    ) : (
        endIcon
    );

    // Layout
    return (
        <Button
            disabled={loading}
            endIcon={localEndIcon}
            onClick={async (event) => {
                if (onClick) {
                    // Update state
                    setLoading(true);

                    // const AsyncFunction = (async () => {}).constructor;
                    // onClick instanceof AsyncFunction
                    if (onClick.constructor.name === 'AsyncFunction') {
                        await onClick(event);
                    } else {
                        onClick(event);
                    }

                    setLoading(false);
                }
            }}
            {...rest}
        />
    );
}
