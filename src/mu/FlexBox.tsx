import React, { ReactNode } from 'react';
import { Box, Theme } from '@material-ui/core';
import {
    SxProps,
    SystemStyleObject,
    ResponsiveStyleValue
} from '@material-ui/system';
import { Property } from 'csstype';

/**
 * Flex box properties
 */
export type FlexBoxProps = Exclude<SxProps<Theme>, 'display'> & {
    children?: ReactNode;
    className?: string;
    itemStyle?: SxProps<Theme>;
};

/**
 * HBox and VBox props
 */
export type HVBoxProps = Exclude<FlexBoxProps, 'flexDirection'> & {
    itemPadding?:
        | SystemStyleObject<Theme>
        | ResponsiveStyleValue<
              | Property.Padding<string | number>
              | (Property.Padding<string | number> | undefined)[]
              | undefined
          >;
};

/**
 * Flex style box component
 * @param props Props
 * @returns Box
 */
export function FlexBox(props: FlexBoxProps) {
    const { children, className, itemStyle, ...rest } = props;

    return (
        <Box
            className={className}
            sx={{
                display: 'flex',
                '& > div, button, input': itemStyle, // Only div elements supported
                ...rest
            }}
        >
            {children}
        </Box>
    );
}
