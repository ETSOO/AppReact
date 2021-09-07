import { css } from '@emotion/css';
import { Utils } from '@etsoo/shared';
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
    idField?: string;

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
     * Click callback
     */
    onClick: (div: HTMLDivElement, data: T) => void;

    /**
     * Inner item renderer
     */
    innerItemRenderer: (
        props: ScrollerListExInnerItemRendererProps<T>
    ) => React.ReactNode;

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
    onClick,
    selected,
    style
}: defaultItemRendererProps<T>) {
    // Child
    const child = innerItemRenderer({ index, data, style, selected });

    let rowClass = `ScrollerListEx-Row${index % 2}`;
    if (selected) rowClass += ` ${selectedClassName}`;

    // Layout
    return (
        <div
            className={rowClass}
            style={style}
            onClick={(event) => onClick(event.currentTarget, data)}
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
export function ScrollerListEx<T extends Record<string, any>>(
    props: ScrollerListExProps<T>
) {
    // Selected item state
    const [state, setState] = React.useState<{
        selectedDiv?: HTMLDivElement;
        selectedItem?: T;
    }>({});

    const onClick = (div: HTMLDivElement, data: T) => {
        const { selectedDiv, selectedItem } = state;
        if (selectedItem != null && selectedItem[idField] === data[idField])
            return;

        if (selectedDiv != null)
            selectedDiv.classList.remove(selectedClassName);

        div.classList.add(selectedClassName);

        setState({
            selectedDiv: div,
            selectedItem: data
        });

        if (onSelectChange) onSelectChange([data]);
    };

    const isSelected = (data?: T) => {
        const { selectedItem } = state;
        const selected =
            selectedItem && data && selectedItem[idField] === data[idField]
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
        itemKey = (index: number, data: T) =>
            data != null && idField in data ? data[idField] : index,
        itemRenderer = (itemProps) =>
            defaultItemRenderer({
                innerItemRenderer,
                onClick,
                selected: isSelected(itemProps.data),
                ...itemProps
            }),
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
            {...rest}
        />
    );
}
