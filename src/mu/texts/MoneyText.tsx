import { Typography } from '@mui/material';
import React from 'react';
import { NumberTextProps } from './NumberText';

/**
 * Money text props
 */
export interface MoneyTextProps extends NumberTextProps {
    /**
     * Currency, USD for US dollar
     */
    currency?: string;
}

/**
 * Money text
 * @param props Props
 * @returns Component
 */
export function MoneyText(props: MoneyTextProps) {
    // Destruct
    const { currency, locale = 'lookup', options = {}, value, ...rest } = props;

    // Default
    if (currency) {
        options.style ??= 'currency';
        options.currency = currency;
    }

    options.minimumFractionDigits ??= 2;

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
