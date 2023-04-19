import { EntityStatus } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import React from 'react';
import { GridLoaderStates } from './GridLoader';
import { ScrollerGridForwardRef } from './ScrollerGrid';

/**
 * Grid data type
 */
import GridDataType = DataTypes.CombinedEnum;
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
            type === GridDataType.IntMoney ||
            type === GridDataType.Int ||
            type === GridDataType.Number
        )
            return 'right';
        else if (type === GridDataType.Boolean) return 'center';
    }
    return align;
};

/**
 * Grid deleted cell box style
 * @param data Data
 * @returns Result
 */
export const GridDeletedCellBoxStyle = (
    data: undefined | { status: EntityStatus } | { entityStatus: EntityStatus }
): React.CSSProperties => {
    if (data == null) return {};

    const status =
        'status' in data
            ? data.status
            : 'entityStatus' in data
            ? data.entityStatus
            : EntityStatus.Normal;

    if (status === EntityStatus.Inactivated || status === EntityStatus.Deleted)
        return { textDecoration: 'line-through' };

    return {};
};

/**
 * Grid cell value type
 */
export type GridCellValueType = string | number | Date | boolean | undefined;

/**
 * Grid cell formatter props
 */
export type GridCellFormatterProps<T> = {
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
};

/**
 * Grid cell renderer props
 */
export type GridCellRendererProps<T, P = any> = GridCellFormatterProps<T> & {
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

    /**
     * Render props
     */
    renderProps?: GridColumnRenderProps;

    /**
     * Set items for rerenderer
     * @param callback Callback
     */
    setItems: (
        callback: (
            items: T[],
            ref?: ScrollerGridForwardRef<T>
        ) => T[] | undefined | void
    ) => void;
};

/**
 * Grid header cell renderer props
 */
export type GridHeaderCellRendererProps<T, P = any> = {
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
};

/**
 * Grid column render props
 */
export type GridColumnRenderProps = {
    /**
     * Culture, like zh-CN
     */
    readonly culture?: string;

    /**
     * Time zone
     */
    readonly timeZone?: string;

    /**
     * Currency, like USD for US dollar
     */
    readonly currency?: string;

    /**
     * Number format options
     */
    readonly numberFormatOptions?: Intl.NumberFormatOptions;

    /**
     * Near days to show alert
     */
    readonly nearDays?: number;

    /**
     * Additional data
     */
    readonly data?: Readonly<Record<string, any>>;
};

/**
 * Grid column
 */
export type GridColumn<T> = {
    /**
     * The column identifier. It's used to map with row data
     */
    field?: string & keyof T;

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
     * Cell box style
     */
    cellBoxStyle?:
        | ((data: T | undefined) => React.CSSProperties)
        | React.CSSProperties;

    /**
     * Render props
     */
    renderProps?: GridColumnRenderProps;

    /**
     * Header cell renderer
     */
    headerCellRenderer?: (
        props: GridHeaderCellRendererProps<T>
    ) => React.ReactNode;
};
