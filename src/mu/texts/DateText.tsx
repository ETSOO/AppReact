import { DateUtils } from '@etsoo/shared';
import { Typography, TypographyProps } from '@mui/material';
import React from 'react';

/**
 * Date text props
 */
export interface DateTextProps extends TypographyProps {
    /**
     * Locale
     */
    locale?: string;

    /**
     * Options
     */
    options?: DateUtils.FormatOptions;

    /**
     * Time zone
     */
    timeZone?: string;

    /**
     * Value to display
     */
    value?: Date | string;
}

/**
 * Date text
 * @param props Props
 * @returns Component
 */
export function DateText(props: DateTextProps) {
    // Destruct
    const { locale = 'lookup', options, timeZone, value, ...rest } = props;

    // Formatted value
    const localValue =
        value == null
            ? undefined
            : DateUtils.format(value, locale, options, timeZone);

    // Layout
    return (
        <Typography component="span" fontSize="inherit" {...rest}>
            {localValue}
        </Typography>
    );
}
