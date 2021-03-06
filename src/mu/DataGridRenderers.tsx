import React from 'react';
import { CircularProgress } from '@mui/material';
import { GridCellRendererProps, GridDataType } from '../components/GridColumn';
import { DateUtils } from '@etsoo/shared';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { DataGridExFooterItemRendererProps } from './DataGridEx';

/**
 * Data grid renderers
 */
export namespace DataGridRenderers {
    /**
     * Default cell renderer
     * @param param Props
     * @returns Component
     */
    export function defaultCellRenderer<T extends Record<string, any>>({
        cellProps,
        data,
        field,
        formattedValue,
        columnIndex,
        type
    }: GridCellRendererProps<T>): React.ReactNode {
        // Is loading
        if (data == null) {
            // First column, show loading indicator
            if (columnIndex === 0) return <CircularProgress size={15} />;

            // Others return undefined
            return undefined;
        }

        // No formatted value and data field
        if (formattedValue == null && field == null) return undefined;

        // Cell value
        const value = formattedValue ?? data[field!];
        if (value == null) return undefined;

        // For date time
        if (value instanceof Date) {
            return DateUtils.format(
                navigator.language,
                value,
                type === GridDataType.DateTime ? 'ds' : 'd'
            );
        }

        // For numbers
        if (typeof value === 'number') {
            if (type === GridDataType.Money)
                return new Intl.NumberFormat('lookup', {
                    minimumFractionDigits: 2
                }).format(value);
            else return new Intl.NumberFormat().format(value);
        }

        // For boolean
        if (typeof value === 'boolean') {
            // Add style
            if ('align' in cellProps) {
                cellProps.sx = {
                    paddingTop: '12px!important',
                    paddingBottom: '6px!important'
                };
            } else {
                cellProps.sx = {
                    paddingTop: '16px!important',
                    paddingBottom: '8px!important'
                };
            }

            if (value) return <CheckIcon fontSize="small" />;
            else return <ClearIcon fontSize="small" />;
        }

        // To string
        return new String(value);
    }

    /**
     * Default footer item renderer
     * @param param Props
     * @returns Component
     */
    export function defaultFooterItemRenderer<T>({
        index,
        states,
        checkable
    }: DataGridExFooterItemRendererProps<T>) {
        const { selectedItems, rows, hasNextPage } = states;

        if (checkable && index === 1) {
            return [
                selectedItems.length,
                rows.length.toLocaleString() + (hasNextPage ? '+' : '')
            ].join(' / ');
        }

        if (!checkable && index === 0) {
            return rows.length.toLocaleString() + (hasNextPage ? '+' : '');
        }

        return undefined;
    }
}
