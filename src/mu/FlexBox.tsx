import React, { ReactNode } from 'react';
import { Box } from '@material-ui/core';
import { Property } from 'csstype';

/**
 * Flex box properties
 */
export interface FlexBoxProps {
    children?: ReactNode;

    alignItems?: Property.AlignItems;
    borderRadius?: Property.BorderRadius;
    boxShadow?: Property.BoxShadow | number;
    flexDirection?: Property.FlexDirection;
    justifyContent?: Property.JustifyContent;
    padding?: Property.Padding;
}

/**
 * Flex style box component
 * @param props Props
 * @returns Box
 */
export function FlexBox(props: FlexBoxProps) {
    const {
        children,
        alignItems = 'center',
        borderRadius,
        boxShadow,
        flexDirection,
        justifyContent = 'space-between',
        padding
    } = props;

    return (
        <Box
            sx={{
                display: 'flex',
                overflow: 'hidden',
                flexDirection,
                alignItems,
                justifyContent,
                borderRadius,
                boxShadow,
                padding
            }}
        >
            {children}
        </Box>
    );
}
