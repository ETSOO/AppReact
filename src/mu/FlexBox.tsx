import React, { ReactNode } from 'react';
import { Box, Theme } from '@material-ui/core';
import { SxProps } from '@material-ui/system';

/**
 * Flex box properties
 */
export type FlexBoxProps = SxProps<Theme> & {
    children?: ReactNode;
    className?: string;
};

/**
 * Flex style box component
 * @param props Props
 * @returns Box
 */
export function FlexBox(props: FlexBoxProps) {
    const { children, className, ...rest } = props;

    return (
        <Box
            className={className}
            sx={{
                display: 'flex',
                ...rest
            }}
        >
            {children}
        </Box>
    );
}
