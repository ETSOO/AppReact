import { Typography, TypographyProps } from '@mui/material';
import React from 'react';

/**
 * Number text props
 */
export interface NumberTextProps extends TypographyProps {
    /**
     * Locale
     */
    locale?: string;

    /**
     * Options
     */
    options?: Intl.NumberFormatOptions;

    /**
     * Value
     */
    value?: number | bigint;
}

/**
 * Number text
 * @param props Props
 * @returns Component
 */
export function NumberText(props: NumberTextProps) {
    // Destruct
    const { locale = 'lookup', options = {}, value, ...rest } = props;

    // Formatter
    const intl = new Intl.NumberFormat(locale, options);

    // Formatted value
    const localValue = value == null ? undefined : intl.format(value);

    // Layout
    return (
        <Typography noWrap {...rest}>
            {localValue}
        </Typography>
    );
}
