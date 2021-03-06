import {
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableCellProps,
    TableContainer,
    TableHead,
    TablePagination,
    TableProps,
    TableRow,
    TableSortLabel,
    useTheme
} from '@mui/material';
import React from 'react';
import {
    GridAlignGet,
    GridCellFormatterProps,
    GridColumn
} from '../components/GridColumn';
import {
    GridLoadDataProps,
    GridLoader,
    GridLoaderStates,
    GridSizeGet
} from '../components/GridLoader';
import { DataGridRenderers } from './DataGridRenderers';
import { GridMethodRef } from './GridMethodRef';

/**
 * Extended table min width for width-unset column
 */
export const TableExMinWidth: number = 180;

/**
 * Extended table methods ref
 */
export interface TableExMethodRef extends GridMethodRef {
    /**
     * Refresh data
     */
    refresh(): void;
}

/**
 * Extended table props
 */
export interface TableExProps<T extends Record<string, any>>
    extends TableProps,
        GridLoader<T> {
    /**
     * Alternating colors for odd/even rows
     */
    alternatingColors?: [string?, string?];

    /**
     * Columns
     */
    columns: GridColumn<T>[];

    /**
     * Header cells background color and font color
     */
    headerColors?: [string?, string?];

    /**
     * Id field
     */
    idField?: string;

    /**
     * Max height
     */
    maxHeight?: number;

    /**
     * Methods
     */
    mRef?: React.Ref<TableExMethodRef>;

    /**
     * On items select change
     */
    onSelectChange?: (selectedItems: T[]) => void;

    /**
     * Row height
     */
    rowHeight?: number;

    /**
     * Header and bottom height
     */
    otherHeight?: number;
}

/**
 * Extended Table
 * @param props Props
 * @returns Component
 */
export function TableEx<T extends Record<string, any>>(props: TableExProps<T>) {
    // Theme
    const theme = useTheme();

    // Destruct
    const {
        alternatingColors = [theme.palette.action.hover, undefined],
        autoLoad = true,
        columns,
        defaultOrderBy,
        headerColors = [undefined, undefined],
        idField = 'id',
        loadBatchSize,
        loadData,
        maxHeight,
        mRef,
        onSelectChange,
        rowHeight = 53,
        otherHeight = 110,
        threshold,
        ...rest
    } = props;

    const selectable: boolean = onSelectChange != null;

    // Rows per page
    let rowsPerPageLocal: number;
    if (maxHeight != null) {
        if (loadBatchSize != null)
            rowsPerPageLocal = GridSizeGet(loadBatchSize, maxHeight);
        else
            rowsPerPageLocal = Math.floor(
                (maxHeight - otherHeight) / rowHeight
            );
    } else if (typeof loadBatchSize === 'number') {
        rowsPerPageLocal = loadBatchSize;
    } else {
        rowsPerPageLocal = 10;
    }

    // States
    const [state, stateUpdate] = React.useReducer(
        (
            currentState: GridLoaderStates<T>,
            newState: Partial<GridLoaderStates<T>>
        ) => {
            return { ...currentState, ...newState };
        },
        {
            autoLoad,
            currentPage: 0,
            hasNextPage: true,
            isNextPageLoading: false,
            orderBy: defaultOrderBy,
            orderByAsc: defaultOrderBy
                ? columns.find((column) => column.field === defaultOrderBy)
                      ?.sortAsc
                : undefined,
            rows: [],
            batchSize: rowsPerPageLocal,
            selectedItems: []
        }
    );
    const isMounted = React.useRef(true);

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
            /**
             * Refresh data
             */
            refresh(): void {
                loadDataLocal();
            },

            /**
             * Reset
             */
            reset
        }),
        []
    );

    // Load data
    const loadDataLocal = () => {
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
            if (!isMounted.current || result == null) {
                return;
            }

            const newItems = result.length;

            stateUpdate({
                rows: result,
                lastLoadedItems: newItems,
                hasNextPage: newItems >= batchSize,
                isNextPageLoading: false
            });
        });
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        state.hasNextPage = true;
        state.currentPage = newPage;
        loadDataLocal();
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const rowsPerPage = parseInt(event.target.value);
        reset({ rowsPerPage });
    };

    const handleSelect = (item: T, checked: Boolean) => {
        const selectedItems = [...state.selectedItems];

        const index = selectedItems.findIndex(
            (selectedItem) => selectedItem[idField] === item[idField]
        );
        if (checked) {
            if (index === -1) selectedItems.push(item);
        } else {
            if (index !== -1) selectedItems.splice(index, 1);
        }

        if (onSelectChange != null) {
            onSelectChange(selectedItems);
        }

        stateUpdate({ selectedItems });
    };

    const handleSelectAll = (checked: boolean) => {
        const selectedItems = [...state.selectedItems];

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

        if (onSelectChange != null) {
            onSelectChange(selectedItems);
        }

        stateUpdate({ selectedItems });
    };

    // New sort
    const handleSort = (field: string, asc?: boolean) => {
        reset({ orderBy: field, orderByAsc: asc });
    };

    // Destruct states
    const {
        autoLoad: stateAutoLoad,
        currentPage,
        hasNextPage,
        lastLoadedItems,
        orderBy,
        rows,
        batchSize,
        selectedItems
    } = state;

    // Current page selected items
    const pageSelectedItems = selectable
        ? rows.reduce((previousValue, currentItem) => {
              if (
                  selectedItems.some(
                      (item) => item[idField] === currentItem[idField]
                  )
              )
                  return previousValue + 1;

              return previousValue;
          }, 0)
        : 0;

    // Total rows
    const totalRows = hasNextPage
        ? -1
        : currentPage * batchSize + (lastLoadedItems ?? 0);

    // Auto load data when current page is 0
    if (currentPage === 0 && stateAutoLoad && lastLoadedItems == null)
        loadDataLocal();

    React.useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Layout
    return (
        <Paper>
            <TableContainer sx={{ maxHeight }}>
                <Table {...rest}>
                    <TableHead>
                        <TableRow
                            sx={{
                                '& th': {
                                    backgroundColor: headerColors[0],
                                    color: headerColors[1]
                                }
                            }}
                        >
                            {selectable && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        indeterminate={
                                            pageSelectedItems > 0 &&
                                            pageSelectedItems < rows.length
                                        }
                                        checked={pageSelectedItems > 0}
                                        onChange={(_event, checked) =>
                                            handleSelectAll(checked)
                                        }
                                    />
                                </TableCell>
                            )}
                            {columns.map((column, index) => {
                                // Destruct
                                const {
                                    align,
                                    field,
                                    header,
                                    minWidth,
                                    sortable,
                                    sortAsc = true,
                                    type,
                                    width
                                } = column;

                                // Header text
                                const headerText = header ?? field;

                                // Sortable
                                let sortLabel: React.ReactNode;
                                if (sortable && field != null) {
                                    const active = orderBy === field;

                                    sortLabel = (
                                        <TableSortLabel
                                            active={active}
                                            direction={sortAsc ? 'asc' : 'desc'}
                                            onClick={(_event) => {
                                                if (active)
                                                    column.sortAsc = !sortAsc;

                                                handleSort(
                                                    field,
                                                    column.sortAsc
                                                );
                                            }}
                                        >
                                            {headerText}
                                        </TableSortLabel>
                                    );
                                } else {
                                    sortLabel = headerText;
                                }

                                return (
                                    <TableCell
                                        align={GridAlignGet(align, type)}
                                        key={field ?? index.toString()}
                                        width={width}
                                        sx={{
                                            minWidth:
                                                minWidth == null
                                                    ? width == null
                                                        ? TableExMinWidth
                                                        : undefined
                                                    : minWidth
                                        }}
                                    >
                                        {sortLabel}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody
                        sx={{
                            '& tr:nth-of-type(odd):not(.Mui-selected)': {
                                backgroundColor: alternatingColors[0]
                            },
                            '& tr:nth-of-type(even):not(.Mui-selected)': {
                                backgroundColor: alternatingColors[1]
                            }
                        }}
                    >
                        {[...Array(batchSize)].map((_item, rowIndex) => {
                            // Row
                            const row = rows[rowIndex];

                            // Row id field value
                            const rowId = row == null ? rowIndex : row[idField];

                            // Selected or not
                            const isItemSelected = selectable
                                ? selectedItems.some(
                                      (item) => item[idField] === rowId
                                  )
                                : false;

                            return (
                                <TableRow key={rowId} selected={isItemSelected}>
                                    {selectable && (
                                        <TableCell padding="checkbox">
                                            {row && (
                                                <Checkbox
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    onChange={(
                                                        _event,
                                                        checked
                                                    ) =>
                                                        handleSelect(
                                                            row,
                                                            checked
                                                        )
                                                    }
                                                />
                                            )}
                                        </TableCell>
                                    )}
                                    {columns.map(
                                        (
                                            {
                                                align,
                                                cellRenderer = DataGridRenderers.defaultCellRenderer,
                                                field,
                                                type,
                                                valueFormatter
                                            },
                                            columnIndex
                                        ) => {
                                            const formatProps: GridCellFormatterProps<T> =
                                                {
                                                    data: row,
                                                    field,
                                                    rowIndex,
                                                    columnIndex
                                                };

                                            const cellProps: TableCellProps = {
                                                align: GridAlignGet(
                                                    align,
                                                    type
                                                ),
                                                valign: 'middle'
                                            };

                                            const child = row ? (
                                                cellRenderer({
                                                    data: row,
                                                    field,
                                                    formattedValue:
                                                        valueFormatter
                                                            ? valueFormatter(
                                                                  formatProps
                                                              )
                                                            : undefined,
                                                    selected: isItemSelected,
                                                    type,
                                                    rowIndex,
                                                    columnIndex,
                                                    cellProps
                                                })
                                            ) : (
                                                <React.Fragment>
                                                    &nbsp;
                                                </React.Fragment>
                                            );

                                            return (
                                                <TableCell
                                                    key={rowId + columnIndex}
                                                    {...cellProps}
                                                >
                                                    {child}
                                                </TableCell>
                                            );
                                        }
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                showFirstButton
                count={totalRows}
                rowsPerPage={batchSize}
                page={currentPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[
                    batchSize,
                    2 * batchSize,
                    5 * batchSize,
                    10 * batchSize
                ]}
            />
        </Paper>
    );
}
