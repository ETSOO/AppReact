import { Box, BoxProps, useTheme } from '@mui/material';
import React from 'react';

/**
 * Fabs container box props
 */
export type FabBoxProps = BoxProps;

/**
 * Fabs container box
 * @param props Props
 * @returns Component
 */
export function FabBox(props: FabBoxProps) {
    // Destruct
    const { sx = {}, ...rest } = props;

    // Theme
    const theme = useTheme();
    const spaceGap = theme.spacing(1);
    const spaceMobile = theme.spacing(4);
    const spaceOther = theme.spacing(5);

    // Default style
    Object.assign(sx, {
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        '& > :not(style) + :not(style)': {
            marginTop: spaceGap
        },
        bottom: { xs: spaceMobile, sm: spaceOther },
        right: { xs: spaceMobile, sm: spaceOther }
    });

    return <Box sx={sx} {...rest} />;
}
