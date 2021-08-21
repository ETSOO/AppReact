import React from 'react';
import {
    Align,
    GridChildComponentProps,
    GridOnItemsRenderedProps,
    VariableSizeGrid,
    VariableSizeGridProps
} from 'react-window';
import { GridMethodRef } from '../mu/GridMethodRef';
import { GridLoadDataProps, GridLoader, GridLoaderStates } from './GridLoader';

export interface ScrollerGridItemRendererProps<T>
    extends GridChildComponentProps<T> {
    /**
     * Selected items
     */
    selectedItems: T[];
}

/**
 * Scroller vertical grid props
 */
export interface ScrollerGridProps<T>
    extends GridLoader<T>,
        Omit<
            VariableSizeGridProps<T>,
            'children' | 'rowCount' | 'rowHeight' | 'ref'
        > {
    /**
     * Default order by asc
     * @default true
     */
    defaultOrderByAsc?: boolean;

    /**
     * Footer renderer
     */
    footerRenderer?: (states: GridLoaderStates<T>) => React.ReactNode;

    /**
     * Header renderer
     */
    headerRenderer?: (states: GridLoaderStates<T>) => React.ReactNode;

    /**
     * Id field
     * @default id
     */
    idField?: string;

    /**
     * Item renderer
     */
    itemRenderer: (
        props: ScrollerGridItemRendererProps<T>
    ) => React.ReactElement;

    /**
     * Methods
     */
    mRef?: React.Ref<ScrollerGridForwardRef>;

    /**
     * On items select change
     */
    onSelectChange?: (selectedItems: T[]) => void;

    /**
     * Returns the height of the specified row.
     */
    rowHeight?: ((index: number) => number) | number;
}

/**
 * Scroller grid forward ref
 */
export interface ScrollerGridForwardRef extends GridMethodRef {
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
export const ScrollerGrid = <T extends Record<string, any>>(
    props: ScrollerGridProps<T>
) => {
    // Destruct
    const {
        autoLoad = true,
        defaultOrderBy,
        defaultOrderByAsc,
        footerRenderer,
        headerRenderer,
        itemRenderer,
        idField = 'id',
        loadBatchSize,
        loadData,
        mRef,
        onItemsRendered,
        onSelectChange,
        rowHeight = 53,
        threshold = 6,
        width,
        ...rest
    } = props;

    // States
    const [state, stateUpdate] = React.useReducer(
        (
            currentState: GridLoaderStates<T>,
            newState: Partial<GridLoaderStates<T>>
        ) => {
            if (!currentState.mounted) return currentState;
            return { ...currentState, ...newState };
        },
        {
            autoLoad,
            currentPage: 0,
            hasNextPage: true,
            mounted: true,
            isNextPageLoading: false,
            orderBy: defaultOrderBy,
            orderByAsc: defaultOrderByAsc,
            rows: [],
            batchSize: 10,
            selectedItems: []
        }
    );

    const ref = React.createRef<VariableSizeGrid<T>>();

    // Load data
    const loadDataLocal = (pageAdd: number = 1) => {
        // Prevent multiple loadings
        if (!state.hasNextPage || state.isNextPageLoading) return;

        // Update state
        state.isNextPageLoading = true;
        // stateUpdate({ isNextPageLoading: true });

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
            if (result == null) {
                return;
            }

            const newItems = result.length;

            if (pageAdd === 0) {
                // New items
                const rows = state.lastLoadedItems
                    ? state.rows
                          .splice(
                              state.rows.length - state.lastLoadedItems,
                              state.lastLoadedItems
                          )
                          .concat(result)
                    : result;

                // Refresh current page
                stateUpdate({
                    rows,
                    lastLoadedItems: newItems,
                    isNextPageLoading: false,
                    hasNextPage: newItems >= batchSize
                });
            } else {
                stateUpdate({
                    rows: state.rows.concat(result),
                    lastLoadedItems: newItems,
                    isNextPageLoading: false,
                    currentPage: state.currentPage + pageAdd,
                    hasNextPage: newItems >= batchSize
                });
            }
        });
    };

    // Item renderer
    const itemRendererLocal = (
        itemProps: GridChildComponentProps<T>,
        state: GridLoaderStates<T>
    ) => {
        // Custom render
        return itemRenderer({
            ...itemProps,
            data: state.rows[itemProps.rowIndex],
            selectedItems: state.selectedItems
        });
    };

    // Local items renderer callback
    const onItemsRenderedLocal = (props: GridOnItemsRenderedProps) => {
        // No items, means no necessary to load more data during reset
        const itemCount = state.rows.length;
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
    const reset = (add?: {}) => {
        const state = {
            autoLoad: true,
            currentPage: 0,
            hasNextPage: true,
            isNextPageLoading: false,
            lastLoadedItems: undefined,
            rows: [],
            ...add
        };
        stateUpdate(state);
    };

    React.useImperativeHandle(
        mRef,
        () => ({
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
                selectedItems[0] = state.rows[rowIndex];

                if (onSelectChange) onSelectChange(selectedItems);

                stateUpdate({ selectedItems });
            },
            selectAll(checked: boolean) {
                const selectedItems = state.selectedItems;

                state.rows.forEach((row) => {
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

                stateUpdate({ selectedItems });
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

                stateUpdate({ selectedItems });
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
        }),
        [state.rows, state.selectedItems]
    );

    React.useEffect(() => {
        return () => {
            state.mounted = false;
        };
    }, []);

    // Destruct state
    const { autoLoad: stateAutoLoad, rows, hasNextPage, currentPage } = state;
    const rowLength = rows.length;

    // Row count
    const rowCount = hasNextPage ? rowLength + 1 : rowLength;

    // Auto load data when current page is 0
    if (currentPage === 0 && stateAutoLoad) loadDataLocal();

    // Layout
    return (
        <React.Fragment>
            {headerRenderer && headerRenderer(state)}
            <VariableSizeGrid<T>
                itemKey={({ columnIndex, rowIndex }) => {
                    const data = state.rows[rowIndex];
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
            {footerRenderer && footerRenderer(state)}
        </React.Fragment>
    );
};
