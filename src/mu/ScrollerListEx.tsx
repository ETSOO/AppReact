import { css } from '@emotion/css';
import { DataTypes, Utils } from '@etsoo/shared';
import React from 'react';
import { ListChildComponentProps } from 'react-window';
import { ScrollerList, ScrollerListProps } from '../components/ScrollerList';

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
}

/**
 * Extended ScrollerList Props
 */
export interface ScrollerListExProps<T>
    extends Omit<ScrollerListProps<T>, 'itemRenderer'> {
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
    itemHeight
}: defaultItemRendererProps<T>) {
    // Child
    const child = innerItemRenderer({
        index,
        data,
        style,
        selected,
        itemHeight
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
            const itemHeight =
                typeof itemSize === 'function'
                    ? itemSize(itemProps.index)
                    : itemSize;
            return defaultItemRenderer({
                itemHeight,
                innerItemRenderer,
                onMouseDown,
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
            itemSize={itemSize}
            {...rest}
        />
    );
}
