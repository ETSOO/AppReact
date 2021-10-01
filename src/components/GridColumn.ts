import { DataTypes } from '@etsoo/shared';
import React from 'react';
import { GridLoaderStates } from './GridLoader';

/**
 * Grid data type
 */
import GridDataType = DataTypes.DataType;
export { GridDataType };

/**
 * Grid align
 */
export type GridAlign = 'center' | 'inherit' | 'justify' | 'left' | 'right';

/**
 * Data align get
 * @param align Align
 * @param type Data type
 */
export const GridAlignGet = (align?: GridAlign, type?: GridDataType) => {
    if (align == null && type != null) {
        if (
            type === GridDataType.Money ||
            type === GridDataType.Int ||
            type === GridDataType.Number
        )
            return 'right';
        else if (type === GridDataType.Boolean) return 'center';
    }
    return align;
};

/**
 * Grid cell value type
 */
export type GridCellValueType = string | number | Date | boolean | undefined;

/**
 * Grid cell formatter props
 */
export interface GridCellFormatterProps<T> {
    /**
     * Current data
     */
    data?: T;

    /**
     * Data field
     */
    field?: string;

    /**
     * Row index
     */
    rowIndex: number;

    /**
     * Column index
     */
    columnIndex: number;
}

/**
 * Grid cell renderer props
 */
export interface GridCellRendererProps<T, P = any>
    extends GridCellFormatterProps<T> {
    /**
     * Cell props
     */
    cellProps: P;

    /**
     * Formatted value
     */
    formattedValue?: GridCellValueType;

    /**
     * Item selected
     */
    selected: boolean;

    /**
     * Data type
     */
    type?: GridDataType;
}

/**
 * Grid header cell renderer props
 */
export interface GridHeaderCellRendererProps<T, P = any> {
    /**
     * Cell props
     */
    cellProps: P;

    /**
     * Column
     */
    column: GridColumn<T>;

    /**
     * Column index
     */
    columnIndex: number;

    /**
     * States
     */
    states: GridLoaderStates<T>;
}

/**
 * Grid column
 */
export interface GridColumn<T> {
    /**
     * The column identifier. It's used to map with row data
     */
    field?: string;

    /**
     * The title of the column rendered in the column header cell
     */
    header?: string;

    /**
     * Set the width of the column
     */
    width?: number;

    /**
     * Sets the minimum width of a column
     */
    minWidth?: number;

    /**
     * Align
     */
    align?: GridAlign;

    /**
     * If `true`, the column is sortable
     * @default true
     */
    sortable?: boolean;

    /**
     * Sort ascending or descending
     */
    sortAsc?: boolean;

    /**
     * Data type
     */
    type?: GridDataType;

    /**
     * Cell value formatter
     */
    valueFormatter?: (props: GridCellFormatterProps<T>) => GridCellValueType;

    /**
     * Cell renderer
     */
    cellRenderer?: (props: GridCellRendererProps<T>) => React.ReactNode;

    /**
     * Header cell renderer
     */
    headerCellRenderer?: (
        props: GridHeaderCellRendererProps<T>
    ) => React.ReactNode;
}
