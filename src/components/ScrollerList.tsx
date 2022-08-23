import { Utils } from '@etsoo/shared';
import React from 'react';
import {
    Align,
    FixedSizeList,
    ListChildComponentProps,
    ListOnItemsRenderedProps,
    ListProps,
    VariableSizeList
} from 'react-window';
import { GridMethodRef } from '../mu/GridMethodRef';
import useCombinedRefs from '../uses/useCombinedRefs';
import {
    GridLoadDataProps,
    GridLoader,
    GridLoaderStates,
    GridSizeGet
} from './GridLoader';

/**
 * Scroller vertical list props
 */
export interface ScrollerListProps<T>
    extends GridLoader<T>,
        Omit<
            ListProps<T>,
            'ref' | 'outerRef' | 'height' | 'width' | 'children' | 'itemCount'
        > {
    /**
     * Default order by asc/desc
     */
    defaultOrderByAsc?: boolean;

    /**
     * Methods ref
     */
    mRef?: React.Ref<ScrollerListForwardRef>;

    /**
     * Outer div ref
     */
    oRef?: React.Ref<HTMLDivElement>;

    /**
     * Height of the list
     */
    height?: number;

    /**
     * Width of the list
     */
    width?: number | string;

    /**
     * Item renderer
     */
    itemRenderer: (props: ListChildComponentProps<T>) => React.ReactElement;

    /**
     * Item size, a function indicates its a variable size list
     */
    itemSize: ((index: number) => number) | number;
}

interface ScrollerListRef {
    /**
     * Scroll to the specified offset (scrollTop or scrollLeft, depending on the direction prop).
     */
    scrollTo(scrollOffset: number): void;

    /**
     * Scroll to the specified item.
     */
    scrollToItem(index: number, align?: Align): void;
}

/**
 * Scroller list forward ref
 */
export interface ScrollerListForwardRef extends GridMethodRef, ScrollerListRef {
    /**
     * Refresh latest page data
     */
    refresh(): void;
}

// Calculate loadBatchSize
const calculateBatchSize = (
    height: number,
    itemSize: ((index: number) => number) | number
) => {
    const size = Utils.getResult(itemSize, 0);
    return 2 + Math.ceil(height / size);
};

/**
 * Scroller vertical list
 * @param props Props
 * @returns Component
 */
export const ScrollerList = <T extends {}>(props: ScrollerListProps<T>) => {
    // Destruct
    const {
        autoLoad = true,
        defaultOrderBy,
        defaultOrderByAsc,
        height = document.documentElement.clientHeight,
        width = '100%',
        mRef,
        oRef,
        style = {},
        itemRenderer,
        itemSize,
        loadBatchSize = calculateBatchSize(height, itemSize),
        loadData,
        threshold = GridSizeGet(loadBatchSize, height) / 2,
        onItemsRendered,
        ...rest
    } = props;

    // Style
    Object.assign(style, {
        width: '100%',
        height: '100%',
        display: 'inline-block'
    });

    // Refs
    const listRef = React.useRef<any>();
    const outerRef = React.useRef<HTMLDivElement>();

    const refs = useCombinedRefs(oRef, outerRef);

    // Rows
    const [rows, updateRows] = React.useState<T[]>([]);
    const setRows = (rows: T[]) => {
        state.loadedItems = rows.length;
        updateRows(rows);
    };

    // States
    const stateRefs = React.useRef<GridLoaderStates<T>>({
        autoLoad,
        currentPage: 0,
        loadedItems: 0,
        hasNextPage: true,
        isNextPageLoading: false,
        orderBy: defaultOrderBy,
        orderByAsc: defaultOrderByAsc,
        batchSize: GridSizeGet(loadBatchSize, height),
        selectedItems: []
    });
    const state = stateRefs.current;

    // Load data
    const loadDataLocal = (pageAdd: number = 1) => {
        // Prevent multiple loadings
        if (!state.hasNextPage || state.isNextPageLoading) return;

        // Update state
        state.isNextPageLoading = true;

        // Parameters
        const { currentPage, batchSize, orderBy, orderByAsc, data } = state;

        const loadProps: GridLoadDataProps = {
            currentPage,
            batchSize,
            orderBy,
            orderByAsc,
            data
        };

        loadData(loadProps).then((result) => {
            if (result == null || state.isMounted === false) {
                return;
            }
            state.isMounted = true;

            const newItems = result.length;
            state.lastLoadedItems = newItems;
            state.hasNextPage = newItems >= loadBatchSize;
            state.isNextPageLoading = false;

            if (pageAdd === 0) {
                // New items
                const newRows = state.lastLoadedItems
                    ? [...rows]
                          .splice(
                              rows.length - state.lastLoadedItems,
                              state.lastLoadedItems
                          )
                          .concat(result)
                    : result;

                // Update rows
                setRows(newRows);
            } else {
                state.currentPage = state.currentPage + pageAdd;

                // Update rows
                setRows([...rows, ...result]);
            }
        });
    };

    const itemRendererLocal = (itemProps: ListChildComponentProps<T>) => {
        // Custom render
        return itemRenderer({
            ...itemProps,
            data: rows[itemProps.index]
        });
    };

    // Update scroll location
    const updateScroll = (scrollY: number) => {
        const outerItem = outerRef.current;
        const refMethods = listRef.current as ScrollerListRef;
        if (outerItem == null || refMethods == null) return;

        const scrollTop = scrollY - outerItem.offsetTop;

        refMethods.scrollTo(scrollTop);
    };

    React.useImperativeHandle(
        mRef,
        () => {
            const refMethods = listRef.current as ScrollerListRef;

            return {
                refresh(): void {
                    loadDataLocal(0);
                },

                reset(add?: Partial<GridLoaderStates<T>>): void {
                    const resetState: Partial<GridLoaderStates<T>> = {
                        autoLoad: true,
                        lastLoadedItems: undefined,
                        loadedItems: 0,
                        currentPage: 0,
                        hasNextPage: true,
                        isNextPageLoading: false,
                        ...add
                    };
                    Object.assign(state, resetState);

                    // Reset
                    if (state.isMounted !== false) setRows([]);
                },

                scrollTo(scrollOffset: number): void {
                    refMethods.scrollTo(scrollOffset);
                },

                scrollToItem(index: number, align?: Align): void {
                    refMethods.scrollToItem(index, align);
                }
            };
        },
        []
    );

    // When layout ready
    React.useEffect(() => {
        let ticking = false;
        let lastKnownScrollPosition = 0;
        let requestAnimationFrameSeed = 0;

        // Window scroll handler
        const handleWindowScroll = () => {
            lastKnownScrollPosition = window.scrollY;

            if (!ticking) {
                requestAnimationFrameSeed = window.requestAnimationFrame(() => {
                    updateScroll(lastKnownScrollPosition);
                    ticking = false;
                    requestAnimationFrameSeed = 0;
                });
                ticking = true;
            }
        };

        // Add scroll event
        window.addEventListener('scroll', handleWindowScroll);

        // Return clear function
        return () => {
            // Cancel animation frame
            if (requestAnimationFrameSeed > 0)
                window.cancelAnimationFrame(requestAnimationFrameSeed);

            // Remove scroll event
            window.removeEventListener('scroll', handleWindowScroll);

            state.isMounted = false;
        };
    }, []);

    // Row count
    const rowCount = rows.length;

    // Local items renderer callback
    const onItemsRenderedLocal = (props: ListOnItemsRenderedProps) => {
        // No items, means no necessary to load more data during reset

        if (rowCount > 0 && props.visibleStopIndex + threshold > rowCount) {
            // Auto load next page
            loadDataLocal();
        }

        // Custom
        if (onItemsRendered) onItemsRendered(props);
    };

    // Item count
    const itemCount = state.hasNextPage ? rowCount + 1 : rowCount;

    // Auto load data when current page is 0
    if (state.currentPage === 0 && state.autoLoad) loadDataLocal();

    // Layout
    return typeof itemSize === 'function' ? (
        <VariableSizeList<T>
            height={height}
            width={width}
            itemCount={itemCount}
            itemSize={itemSize}
            outerRef={refs}
            ref={listRef}
            style={style}
            onItemsRendered={onItemsRenderedLocal}
            {...rest}
        >
            {itemRendererLocal}
        </VariableSizeList>
    ) : (
        <FixedSizeList<T>
            height={height}
            width={width}
            itemCount={itemCount}
            itemSize={itemSize}
            outerRef={refs}
            ref={listRef}
            style={style}
            onItemsRendered={onItemsRenderedLocal}
            {...rest}
        >
            {itemRendererLocal}
        </FixedSizeList>
    );
};
