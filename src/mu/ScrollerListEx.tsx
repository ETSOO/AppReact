import { css } from '@emotion/css';
import { DataTypes, Utils } from '@etsoo/shared';
import { useTheme } from '@mui/material';
import React from 'react';
import { ListChildComponentProps } from 'react-window';
import { ScrollerList, ScrollerListProps } from '../components/ScrollerList';
import { MUGlobal } from './MUGlobal';

// Scroll bar size
const scrollbarSize = 16;

// Selected class name
const selectedClassName = 'ScrollerListEx-Selected';

const createGridStyle = (
    alternatingColors: [string?, string?],
    selectedColor: string
) => {
    return css({
        '& .ScrollerListEx-Selected': {
            backgroundColor: selectedColor
        },
        '& .ScrollerListEx-Row0:not(.ScrollerListEx-Selected)': {
            backgroundColor: alternatingColors[0]
        },
        '& .ScrollerListEx-Row1:not(.ScrollerListEx-Selected)': {
            backgroundColor: alternatingColors[1]
        },
        '@media (min-width: 800px)': {
            '::-webkit-scrollbar': {
                width: scrollbarSize,
                height: scrollbarSize,
                backgroundColor: '#f6f6f6'
            },
            '::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: '2px'
            },
            '::-webkit-scrollbar-track-piece:start': {
                background: 'transparent'
            },
            '::-webkit-scrollbar-track-piece:end': {
                background: 'transparent'
            }
        }
    });
};

// Default margin
const defaultMargin = (margin: {}, isNarrow?: boolean) => {
    const half = MUGlobal.half(margin);

    if (isNarrow == null) {
        const half = MUGlobal.half(margin);
        return {
            marginLeft: margin,
            marginRight: margin,
            marginTop: half,
            marginBottom: half
        };
    }

    if (isNarrow) {
        return {
            marginLeft: 0,
            marginRight: 0,
            marginTop: half,
            marginBottom: half
        };
    }

    return {
        marginLeft: half,
        marginRight: half,
        marginTop: half,
        marginBottom: half
    };
};

/**
 * Extended ScrollerList inner item renderer props
 */
export interface ScrollerListExInnerItemRendererProps<T>
    extends ListChildComponentProps<T> {
    /**
     * Item selected
     */
    selected: boolean;

    /**
     * Item height
     */
    itemHeight: number;

    /**
     * Item space
     */
    space: number;

    /**
     * Default margins
     */
    margins: {};
}

/**
 * Extended ScrollerList ItemSize type
 * 1. Callback function
 * 2. Static sets
 * 3. Dynamic calculation
 */
export type ScrollerListExItemSize =
    | ((index: number) => [number, number] | [number, number, {}])
    | [number, number]
    | [number, {}, boolean?];

/**
 * Extended ScrollerList Props
 */
export interface ScrollerListExProps<T>
    extends Omit<ScrollerListProps<T>, 'itemRenderer' | 'itemSize'> {
    /**
     * Alternating colors for odd/even rows
     */
    alternatingColors?: [string?, string?];

    /**
     * Id field
     */
    idField?: keyof T;

    /**
     * Inner item renderer
     */
    innerItemRenderer: (
        props: ScrollerListExInnerItemRendererProps<T>
    ) => React.ReactNode;

    /**
     * Item renderer
     */
    itemRenderer?: (props: ListChildComponentProps<T>) => React.ReactElement;

    /**
     * Item size, a function indicates its a variable size list
     */
    itemSize: ScrollerListExItemSize;

    /**
     * On items select change
     */
    onSelectChange?: (selectedItems: T[]) => void;

    /**
     * Selected color
     */
    selectedColor?: string;
}

interface defaultItemRendererProps<T> extends ListChildComponentProps<T> {
    /**
     * onMouseDown callback
     */
    onMouseDown: (div: HTMLDivElement, data: T) => void;

    /**
     * Inner item renderer
     */
    innerItemRenderer: (
        props: ScrollerListExInnerItemRendererProps<T>
    ) => React.ReactNode;

    /**
     * Item height
     */
    itemHeight: number;

    /**
     * Item space
     */
    space: number;

    /**
     * Default margins
     */
    margins: {};

    /**
     * Item selected
     */
    selected: boolean;
}

// Default itemRenderer
function defaultItemRenderer<T>({
    index,
    innerItemRenderer,
    data,
    onMouseDown,
    selected,
    style,
    itemHeight,
    space,
    margins
}: defaultItemRendererProps<T>) {
    // Child
    const child = innerItemRenderer({
        index,
        data,
        style,
        selected,
        itemHeight,
        space,
        margins
    });

    let rowClass = `ScrollerListEx-Row${index % 2}`;
    if (selected) rowClass += ` ${selectedClassName}`;

    // Layout
    return (
        <div
            className={rowClass}
            style={style}
            onMouseDown={(event) => onMouseDown(event.currentTarget, data)}
        >
            {child}
        </div>
    );
}

/**
 * Extended ScrollerList
 * @param props Props
 * @returns Component
 */
export function ScrollerListEx<T extends Record<string, unknown>>(
    props: ScrollerListExProps<T>
) {
    // Selected item ref
    const selectedItem = React.useRef<[HTMLDivElement, T]>();

    const onMouseDown = (div: HTMLDivElement, data: T) => {
        // Destruct
        const [selectedDiv, selectedData] = selectedItem.current ?? [];

        if (selectedData != null && selectedData[idField] === data[idField])
            return;

        selectedDiv?.classList.remove(selectedClassName);

        div.classList.add(selectedClassName);

        selectedItem.current = [div, data];

        if (onSelectChange) onSelectChange([data]);
    };

    const isSelected = (data?: T) => {
        const [_, selectedData] = selectedItem.current ?? [];
        const selected =
            selectedData && data && selectedData[idField] === data[idField]
                ? true
                : false;
        return selected;
    };

    // Theme
    const theme = useTheme();

    // Calculate size
    const calculateItemSize = (index: number): [number, number, {}] => {
        // Callback function
        if (typeof itemSize === 'function') {
            const result = itemSize(index);
            if (result.length == 2)
                return [...result, defaultMargin(MUGlobal.pagePaddings)];
            return result;
        }

        // Calculation
        const [size, spaces, isNarrow] = itemSize;
        if (typeof spaces === 'number')
            return [
                size,
                spaces,
                defaultMargin(MUGlobal.pagePaddings, undefined)
            ];

        return [
            size,
            MUGlobal.getSpace(spaces, theme),
            defaultMargin(spaces, isNarrow)
        ];
    };

    // Local item size
    const itemSizeLocal = (index: number) => {
        const [size, space] = calculateItemSize(index);
        return size + space;
    };

    // Destruct
    const {
        alternatingColors = [undefined, undefined],
        className,
        idField = 'id',
        innerItemRenderer,
        itemSize,
        itemKey = (index: number, data: T) =>
            DataTypes.getIdValue(data, idField) ?? index,
        itemRenderer = (itemProps) => {
            const [itemHeight, space, margins] = calculateItemSize(
                itemProps.index
            );
            return defaultItemRenderer({
                itemHeight,
                innerItemRenderer,
                onMouseDown,
                space,
                margins,
                selected: isSelected(itemProps.data),
                ...itemProps
            });
        },
        onSelectChange,
        selectedColor = '#edf4fb',
        ...rest
    } = props;

    // Layout
    return (
        <ScrollerList<T>
            className={Utils.mergeClasses(
                'ScrollerListEx-Body',
                className,
                createGridStyle(alternatingColors, selectedColor)
            )}
            itemKey={itemKey}
            itemRenderer={itemRenderer}
            itemSize={itemSizeLocal}
            {...rest}
        />
    );
}
