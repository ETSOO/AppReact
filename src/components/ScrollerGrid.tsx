import { DataTypes, IdDefaultType } from '@etsoo/shared';
import React from 'react';
import {
    Align,
    GridChildComponentProps,
    GridOnItemsRenderedProps,
    VariableSizeGrid,
    VariableSizeGridProps
} from 'react-window';
import { GridLoadDataProps, GridLoader, GridLoaderStates } from './GridLoader';
import { GridMethodRef } from './GridMethodRef';

export type ScrollerGridItemRendererProps<T> = Omit<
    GridChildComponentProps<T>,
    'data'
> & {
    /**
     * Selected items
     */
    selectedItems: T[];

    /**
     * Set items for rerenderer
     * @param callback Callback
     */
    setItems: (
        callback: (
            items: T[],
            ref: ScrollerGridForwardRef<T>
        ) => T[] | undefined | void
    ) => void;

    /**
     * Data
     */
    data?: T;
};

/**
 * Scroller vertical grid props
 */
export type ScrollerGridProps<
    T extends object,
    D extends DataTypes.Keys<T>
> = GridLoader<T> &
    Omit<
        VariableSizeGridProps<T>,
        'children' | 'rowCount' | 'rowHeight' | 'ref'
    > & {
        /**
         * Default order by asc
         * @default true
         */
        defaultOrderByAsc?: boolean;

        /**
         * Footer renderer
         */
        footerRenderer?: (
            rows: T[],
            states: GridLoaderStates<T>
        ) => React.ReactNode;

        /**
         * Header renderer
         */
        headerRenderer?: (states: GridLoaderStates<T>) => React.ReactNode;

        /**
         * Id field
         */
        idField?: D;

        /**
         * Item renderer
         */
        itemRenderer: (
            props: ScrollerGridItemRendererProps<T>
        ) => React.ReactElement;

        /**
         * Methods
         */
        mRef?: React.Ref<ScrollerGridForwardRef<T>>;

        /**
         * On items select change
         */
        onSelectChange?: (selectedItems: T[]) => void;

        /**
         * Returns the height of the specified row.
         */
        rowHeight?: ((index: number) => number) | number;
    };

/**
 * Scroller grid forward ref
 */
export interface ScrollerGridForwardRef<T> extends GridMethodRef<T> {
    /**
     * Scroll to the specified offsets
     */
    scrollTo(params: { scrollLeft: number; scrollTop: number }): void;

    scrollToItem(params: {
        align?: Align | undefined;
        columnIndex?: number | undefined;
        rowIndex?: number | undefined;
    }): void;

    /**
     * Scroll to the specified item
     */
    scrollToItem(params: {
        align?: Align | undefined;
        columnIndex?: number | undefined;
        rowIndex?: number | undefined;
    }): void;

    /**
     * Select the item
     * @param rowIndex Row index
     */
    select(rowIndex: number): void;

    /**
     * Select or unselect all items
     * @param checked Checked
     */
    selectAll(checked: boolean): void;

    /**
     * Select item
     * @param item Item
     * @param checked Checked
     */
    selectItem(item: any, checked: boolean): void;

    /**
     *
     * @param index
     * @param shouldForceUpdate
     */
    resetAfterColumnIndex(index: number, shouldForceUpdate?: boolean): void;

    resetAfterIndices(params: {
        columnIndex: number;
        rowIndex: number;
        shouldForceUpdate?: boolean | undefined;
    }): void;

    resetAfterRowIndex(index: number, shouldForceUpdate?: boolean): void;
}

/**
 * Scroller vertical grid
 * @param props Props
 * @returns Component
 */
export const ScrollerGrid = <
    T extends object,
    D extends DataTypes.Keys<T> = IdDefaultType<T>
>(
    props: ScrollerGridProps<T, D>
) => {
    // Destruct
    const {
        autoLoad = true,
        defaultOrderBy,
        defaultOrderByAsc,
        footerRenderer,
        headerRenderer,
        itemRenderer,
        idField = 'id' as D,
        loadBatchSize,
        loadData,
        mRef,
        onItemsRendered,
        onSelectChange,
        rowHeight = 53,
        threshold = 6,
        width,
        onInitLoad,
        onUpdateRows,
        ...rest
    } = props;

    // Rows
    const [rows, updateRows] = React.useState<T[]>([]);
    const setRows = (rows: T[], reset: boolean = false) => {
        state.loadedItems = rows.length;
        updateRows(rows);

        if (!reset && onUpdateRows) onUpdateRows(rows, state);
    };

    // Refs
    const refs = React.useRef<GridLoaderStates<T>>({
        autoLoad,
        currentPage: 0,
        hasNextPage: true,
        isNextPageLoading: false,
        orderBy: defaultOrderBy,
        orderByAsc: defaultOrderByAsc,
        batchSize: 10,
        loadedItems: 0,
        selectedItems: [],
        idCache: {}
    });
    const state = refs.current;

    const ref = React.useRef<VariableSizeGrid<T>>(null);

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
            state.isNextPageLoading = false;
            state.hasNextPage = newItems >= batchSize;

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
                // Set current page
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

    // Item renderer
    const itemRendererLocal = (
        itemProps: GridChildComponentProps<T>,
        state: GridLoaderStates<T>
    ) => {
        // Custom render
        const data =
            itemProps.rowIndex < rows.length
                ? rows[itemProps.rowIndex]
                : undefined;
        return itemRenderer({
            ...itemProps,
            data,
            selectedItems: state.selectedItems,
            setItems: (
                callback: (
                    items: T[],
                    ref: ScrollerGridForwardRef<T>
                ) => T[] | undefined | void
            ) => {
                const result = callback(rows, instance);
                if (result == null) return;
                setRows(result);
            }
        });
    };

    // Local items renderer callback
    const onItemsRenderedLocal = (props: GridOnItemsRenderedProps) => {
        // No items, means no necessary to load more data during reset
        const itemCount = rows.length;
        if (
            itemCount > 0 &&
            props.visibleRowStopIndex + threshold > itemCount
        ) {
            // Auto load next page
            loadDataLocal();
        }

        // Custom
        if (onItemsRendered) onItemsRendered(props);
    };

    // Reset the state and load again
    const reset = (add?: Partial<GridLoaderStates<T>>, items: T[] = []) => {
        const resetState: Partial<GridLoaderStates<T>> = {
            autoLoad: true,
            currentPage: 0,
            loadedItems: 0,
            hasNextPage: true,
            isNextPageLoading: false,
            lastLoadedItems: undefined,
            ...add
        };
        Object.assign(state, resetState);

        // Reset items
        if (state.isMounted !== false) setRows(items, true);
    };

    const instance: ScrollerGridForwardRef<T> = {
        scrollTo(params: { scrollLeft: number; scrollTop: number }) {
            ref.current?.scrollTo(params);
        },
        scrollToItem(params: {
            align?: Align | undefined;
            columnIndex?: number | undefined;
            rowIndex?: number | undefined;
        }) {
            ref.current?.scrollToItem(params);
        },
        select(rowIndex: number) {
            // Select only one item
            const selectedItems = state.selectedItems;
            selectedItems[0] = rows[rowIndex];

            if (onSelectChange) onSelectChange(selectedItems);
        },
        selectAll(checked: boolean) {
            const selectedItems = state.selectedItems;

            rows.forEach((row) => {
                const index = selectedItems.findIndex(
                    (selectedItem) => selectedItem[idField] === row[idField]
                );

                if (checked) {
                    if (index === -1) selectedItems.push(row);
                } else if (index !== -1) {
                    selectedItems.splice(index, 1);
                }
            });

            if (onSelectChange) onSelectChange(selectedItems);
        },
        selectItem(item: T, checked: boolean) {
            const selectedItems = state.selectedItems;
            const index = selectedItems.findIndex(
                (selectedItem) => selectedItem[idField] === item[idField]
            );

            if (checked) {
                if (index === -1) selectedItems.push(item);
            } else {
                if (index !== -1) selectedItems.splice(index, 1);
            }

            if (onSelectChange) onSelectChange(selectedItems);
        },
        reset,
        resetAfterColumnIndex(index: number, shouldForceUpdate?: boolean) {
            ref.current?.resetAfterColumnIndex(index, shouldForceUpdate);
        },
        resetAfterIndices(params: {
            columnIndex: number;
            rowIndex: number;
            shouldForceUpdate?: boolean | undefined;
        }) {
            ref.current?.resetAfterIndices(params);
        },
        resetAfterRowIndex(index: number, shouldForceUpdate?: boolean) {
            ref.current?.resetAfterRowIndex(index, shouldForceUpdate);
        }
    };

    React.useImperativeHandle(mRef, () => instance, [rows]);

    React.useEffect(() => {
        return () => {
            state.isMounted = false;
        };
    }, []);

    // Force update to work with the new width
    React.useEffect(() => {
        ref.current?.resetAfterIndices({
            columnIndex: 0,
            rowIndex: 0,
            shouldForceUpdate: true
        });
    }, [width]);

    // Rows
    const rowLength = rows.length;

    // Row count
    const rowCount = state.hasNextPage ? rowLength + 1 : rowLength;

    // Auto load data when current page is 0
    if (state.currentPage === 0 && state.autoLoad) {
        const initItems =
            onInitLoad == null ? undefined : onInitLoad(ref.current);
        if (initItems) reset(initItems[1], initItems[0]);
        else loadDataLocal();
    }

    // Layout
    return (
        <React.Fragment>
            {headerRenderer && headerRenderer(state)}
            <VariableSizeGrid<T>
                itemKey={({ columnIndex, rowIndex }) => {
                    const data = rows[rowIndex];
                    if (data == null) return [rowIndex, columnIndex].join(',');
                    return [data[idField], columnIndex].join(',');
                }}
                onItemsRendered={onItemsRenderedLocal}
                ref={ref}
                rowCount={rowCount}
                rowHeight={
                    typeof rowHeight === 'function'
                        ? rowHeight
                        : () => rowHeight
                }
                style={{ overflowX: 'hidden' }}
                width={width}
                {...rest}
            >
                {(props) => itemRendererLocal(props, state)}
            </VariableSizeGrid>
            {footerRenderer && footerRenderer(rows, state)}
        </React.Fragment>
    );
};
