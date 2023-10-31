import { DataTypes, IdDefaultType, Utils } from '@etsoo/shared';
import React from 'react';
import {
    Align,
    FixedSizeList,
    ListChildComponentProps,
    ListOnItemsRenderedProps,
    ListProps,
    VariableSizeList
} from 'react-window';
import { useCombinedRefs } from '../uses/useCombinedRefs';
import {
    GridLoadDataProps,
    GridLoader,
    GridLoaderStates,
    GridSizeGet
} from './GridLoader';
import { GridMethodRef } from './GridMethodRef';

/**
 * Scroller vertical list props
 */
export interface ScrollerListProps<
    T extends object,
    D extends DataTypes.Keys<T>
> extends GridLoader<T>,
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
    mRef?: React.Ref<ScrollerListForwardRef<T>>;

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
     * Id field
     */
    idField?: D;

    /**
     * Item renderer
     */
    itemRenderer: (props: ListChildComponentProps<T>) => React.ReactElement;

    /**
     * Item size, a function indicates its a variable size list
     */
    itemSize: ((index: number) => number) | number;
}

/**
 * Scroller list ref
 */
export interface ScrollerListRef {
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
export interface ScrollerListForwardRef<T> extends GridMethodRef<T> {
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
export const ScrollerList = <
    T extends object,
    D extends DataTypes.Keys<T> = IdDefaultType<T>
>(
    props: ScrollerListProps<T, D>
) => {
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
        idField = 'id' as D,
        itemRenderer,
        itemSize,
        loadBatchSize = calculateBatchSize(height, itemSize),
        loadData,
        threshold = GridSizeGet(loadBatchSize, height) / 2,
        onItemsRendered,
        onInitLoad,
        onUpdateRows,
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
    const setRows = (rows: T[], reset: boolean = false) => {
        state.loadedItems = rows.length;
        updateRows(rows);

        if (!reset && onUpdateRows) onUpdateRows(rows, state);
    };

    // States
    const batchSize = GridSizeGet(loadBatchSize, height);
    const stateRefs = React.useRef<GridLoaderStates<T>>({
        autoLoad,
        currentPage: 0,
        loadedItems: 0,
        hasNextPage: true,
        isNextPageLoading: false,
        orderBy: defaultOrderBy,
        orderByAsc: defaultOrderByAsc,
        batchSize: batchSize,
        selectedItems: [],
        idCache: {}
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
            state.hasNextPage = newItems >= batchSize;
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

                state.idCache = {};
                for (const row of newRows) {
                    const id = row[idField] as any;
                    state.idCache[id] = null;
                }

                // Update rows
                setRows(newRows);
            } else {
                state.currentPage = state.currentPage + pageAdd;

                // Update rows, avoid duplicate items
                const newRows = [...rows];

                for (const item of result) {
                    const id = item[idField] as any;
                    if (state.idCache[id] === undefined) {
                        newRows.push(item);
                    }
                }

                setRows(newRows);
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

    // Reset the state and load again
    const reset = (add?: Partial<GridLoaderStates<T>>, items: T[] = []) => {
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
        if (state.isMounted !== false) setRows(items, true);
    };

    React.useImperativeHandle(
        mRef,
        () => {
            const refMethods = listRef.current as ScrollerListRef;

            return {
                delete(index) {
                    const item = rows.at(index);
                    if (item) {
                        const newRows = [...rows];
                        newRows.splice(index, 1);
                        setRows(newRows);
                    }
                    return item;
                },
                insert(item, start) {
                    const newRows = [...rows];
                    newRows.splice(start, 0, item);
                    setRows(newRows);
                },
                refresh(): void {
                    loadDataLocal(0);
                },

                reset,

                scrollToRef(scrollOffset: number): void {
                    refMethods.scrollTo(scrollOffset);
                },

                scrollToItemRef(index: number, align?: Align): void {
                    refMethods.scrollToItem(index, align);
                }
            };
        },
        []
    );

    // When layout ready
    React.useEffect(() => {
        // Return clear function
        return () => {
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
    if (state.currentPage === 0 && state.autoLoad) {
        const initItems =
            onInitLoad == null ? undefined : onInitLoad(listRef.current);
        if (initItems) reset(initItems[1], initItems[0]);
        else loadDataLocal();
    }

    // Layout
    return typeof itemSize === 'function' ? (
        <VariableSizeList<T>
            height={height}
            width={width}
            itemCount={itemCount}
            itemKey={(index, data) =>
                DataTypes.getIdValue1(data, idField) ?? index
            }
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
            itemKey={(index, data) =>
                DataTypes.getIdValue1(data, idField) ?? index
            }
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
