import {
    Box,
    CircularProgress,
    LinearProgress,
    Typography
} from '@mui/material';
import React from 'react';

/**
 * Process count props
 */
export interface ProgressCountProps {
    /**
     * Is countdown or opposite
     * @default 'true'
     */
    countdown?: boolean;

    /**
     * Is linear or circular
     * @default 'true'
     */
    linear?: boolean;

    /**
     * On complete callback, return false will stop it
     */
    onComplete?: () => boolean;

    /**
     * On progress callback
     */
    onProgress?: (value: number) => void;

    /**
     * Value for count
     */
    value: number;

    /**
     * Value unit, like 's' or '%'
     * @default ''
     */
    valueUnit?: string;
}

/**
 * Progress count
 * @param props Props
 * @returns Component
 */
export function ProgressCount(props: ProgressCountProps) {
    // Destruct
    const {
        countdown = true,
        linear = true,
        onComplete,
        onProgress,
        value,
        valueUnit = ''
    } = props;

    // Progress value
    const [progressValue, setProgressValue] = React.useState(
        countdown ? value : 0
    );

    React.useEffect(() => {
        const timer = setInterval(() => {
            setProgressValue((prevProgress) => {
                let newValue = prevProgress + (countdown ? -1 : 1);

                if (countdown) {
                    if (newValue === 0) {
                        if (onComplete) {
                            const result = onComplete();
                            // Finish
                            if (result === false) clearInterval(timer);
                        }
                        newValue = value;
                    }
                } else {
                    if (newValue === value) {
                        if (onComplete) {
                            const result = onComplete();
                            // Finish
                            if (result === false) clearInterval(timer);
                        }
                        newValue = 0;
                    }
                }

                if (onProgress) onProgress(newValue);

                return newValue;
            });
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    if (linear)
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                        variant="determinate"
                        value={progressValue}
                    />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >{`${progressValue}${valueUnit}`}</Typography>
                </Box>
            </Box>
        );

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" value={progressValue} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                >
                    {`${progressValue}${valueUnit}`}
                </Typography>
            </Box>
        </Box>
    );
}
