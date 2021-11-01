import { Box, BoxProps, useTheme } from '@mui/material';
import React from 'react';

/**
 * Fabs container box props
 */
export type FabBoxProps = BoxProps & {
    /**
     * Item gap
     */
    itemGap?: number;

    /**
     * Flex direction, row or column
     */
    columnDirection?: boolean;
};

/**
 * Fabs container box
 * @param props Props
 * @returns Component
 */
export function FabBox(props: FabBoxProps) {
    // Destruct
    const { columnDirection = true, itemGap = 1, sx = {}, ...rest } = props;

    // Theme
    const theme = useTheme();
    const spaceGap = theme.spacing(itemGap);

    // margin
    const margin = columnDirection
        ? { marginTop: spaceGap }
        : { marginLeft: spaceGap };

    // Default style
    Object.assign(sx, {
        position: 'fixed',
        display: 'flex',
        flexDirection: columnDirection ? 'column' : 'row',
        '& > :not(style) + :not(style)': margin
    });

    return <Box sx={sx} {...rest} />;
}
