import { css } from '@emotion/css';
import { Utils } from '@etsoo/shared';
import {
    Box,
    BoxProps,
    Checkbox,
    Paper,
    TableSortLabel,
    useTheme
} from '@mui/material';
import React from 'react';
import {
    GridAlignGet,
    GridCellFormatterProps,
    GridCellRendererProps,
    GridColumn,
    GridHeaderCellRendererProps
} from '../components/GridColumn';
import { GridLoaderStates } from '../components/GridLoader';
import {
    ScrollerGrid,
    ScrollerGridForwardRef,
    ScrollerGridItemRendererProps,
    ScrollerGridProps
} from '../components/ScrollerGrid';
import useCombinedRefs from '../uses/useCombinedRefs';
import { useDimensions } from '../uses/useDimensions';
import { useWindowSize } from '../uses/useWindowSize';
import { DataGridRenderers } from './DataGridRenderers';

/**
 * Footer item renderer props
 */
export interface DataGridExFooterItemRendererProps<
    T extends Record<string, any>
> {
    column: GridColumn<T>;
    index: number;
    states: GridLoaderStates<T>;
    cellProps: any;
    checkable: boolean;
}

/**
 * Extended DataGrid with VariableSizeGrid props
 */
export interface DataGridExProps<T extends Record<string, any>>
    extends Omit<
        ScrollerGridProps<T>,
        'itemRenderer' | 'columnCount' | 'columnWidth' | 'width'
    > {
    /**
     * Alternating colors for odd/even rows
     */
    alternatingColors?: [string?, string?];

    /**
     * Checkable to choose multiple items
     * @default false
     */
    checkable?: boolean;

    /**
     * Rows count to have the bottom border
     */
    borderRowsCount?: number;

    /**
     * Bottom height
     */
    bottomHeight?: number;

    /**
     * Columns
     */
    columns: GridColumn<T>[];

    /**
     * Footer item renderer
     */
    footerItemRenderer?: (
        props: DataGridExFooterItemRendererProps<T>
    ) => React.ReactNode;

    /**
     * Header height
     * @default 56
     */
    headerHeight?: number;

    /**
     * Hide the footer
     * @default false
     */
    hideFooter?: boolean;

    /**
     * Hover color
     */
    hoverColor?: string;

    /**
     * Selectable to support hover over and out effect and row clickable
     * @default true
     */
    selectable?: boolean;

    /**
     * Selected color
     */
    selectedColor?: string;

    /**
     * Width
     */
    width?: number;
}

// Borders
const boldBorder = '2px solid rgba(224, 224, 224, 1)';
const thinBorder = '1px solid rgba(224, 224, 224, 1)';

// Scroll bar size
const scrollbarSize = 16;

// Minimum width
const minWidth = 120;

const createGridStyle = (
    alternatingColors: [string?, string?],
    selectedColor: string,
    hoverColor: string
) => {
    return css({
        '.DataGridEx-Selected': {
            backgroundColor: selectedColor
        },
        '.DataGridEx-Hover:not(.DataGridEx-Selected)': {
            backgroundColor: hoverColor
        },
        '& .DataGridEx-Cell0:not(.DataGridEx-Hover):not(.DataGridEx-Selected)':
            {
                backgroundColor: alternatingColors[0]
            },
        '& .DataGridEx-Cell1:not(.DataGridEx-Hover):not(.DataGridEx-Selected)':
            {
                backgroundColor: alternatingColors[1]
            },
        '& .DataGridEx-Cell-Border': {
            borderBottom: thinBorder
        }
    });
};

interface States {
    gridWidth?: number;
    ref?: ScrollerGridForwardRef;
    selectedRowIndex?: number;
}

const rowItems = (
    div: HTMLDivElement,
    callback: (div: HTMLDivElement) => void
) => {
    const row = div.dataset['row'];
    if (div.parentElement == null || row == null) return;
    doRowItems(div.parentElement, parseFloat(row), callback);
};

const doRowItems = (
    parent: HTMLElement,
    rowIndex: number,
    callback: (div: HTMLDivElement) => void
) => {
    if (parent == null || rowIndex == null) return;

    parent
        ?.querySelectorAll<HTMLDivElement>(`div[data-row="${rowIndex}"]`)
        .forEach((rowItem) => {
            callback(rowItem);
        });
};

/**
 * Extended datagrid columns calculation
 * @param columns
 * @returns Total width and unset items
 */
export function DataGridExCalColumns<T>(columns: GridColumn<T>[]) {
    return columns.reduce<{ total: number; unset: number }>(
        (previousValue, currentItem) => {
            previousValue.total +=
                currentItem.width ?? currentItem.minWidth ?? minWidth;
            if (currentItem.width == null) previousValue.unset++;
            return previousValue;
        },
        {
            total: 0,
            unset: 0
        }
    );
}

/**
 * Extended DataGrid with VariableSizeGrid
 * @param props Props
 * @returns Component
 */
export function DataGridEx<T extends Record<string, any>>(
    props: DataGridExProps<T>
) {
    // Theme
    const theme = useTheme();

    const defaultHeaderRenderer = (states: GridLoaderStates<T>) => {
        const { orderBy } = states;
        return (
            <Box
                className="DataGridEx-Header"
                display="flex"
                alignItems="center"
                borderBottom={boldBorder}
                fontWeight={500}
                minWidth={widthCalculator.total}
                height={headerHeight}
            >
                {columns.map((column, index) => {
                    // Destruct
                    const {
                        align,
                        field,
                        header,
                        headerCellRenderer,
                        sortable,
                        sortAsc = true,
                        type
                    } = column;

                    // Header text
                    const headerText = header ?? field;

                    // Cell props
                    const cellProps: BoxProps = {};

                    // Sortable
                    let sortLabel: React.ReactNode;
                    if (headerCellRenderer) {
                        sortLabel = headerCellRenderer({
                            cellProps,
                            column,
                            columnIndex: index,
                            states
                        });
                    } else if (sortable && field != null) {
                        const active = orderBy === field;

                        sortLabel = (
                            <TableSortLabel
                                active={active}
                                direction={sortAsc ? 'asc' : 'desc'}
                                onClick={(_event) => {
                                    if (active) column.sortAsc = !sortAsc;

                                    handleSort(field, column.sortAsc);
                                }}
                            >
                                {headerText}
                            </TableSortLabel>
                        );
                    } else {
                        sortLabel = headerText;
                    }

                    return (
                        <Box
                            key={field ?? index.toString()}
                            textAlign={GridAlignGet(align, type)}
                            width={columnWidth(index)}
                        >
                            <Box
                                className="DataGridEx-Cell"
                                onMouseEnter={handleMouseEnter}
                                {...cellProps}
                            >
                                {sortLabel}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    };

    function defaultFooterRenderer(states: GridLoaderStates<T>) {
        return (
            <Box
                className="DataGridEx-Footer"
                display="flex"
                alignItems="center"
                borderTop={thinBorder}
                marginTop="1px"
                minWidth={widthCalculator.total}
                height={bottomHeight - 1}
            >
                {columns.map((column, index) => {
                    // Destruct
                    const { align, field, type } = column;

                    // Cell props
                    const cellProps: BoxProps = {};

                    // Cell
                    const cell = footerItemRenderer
                        ? footerItemRenderer({
                              column,
                              index,
                              states,
                              cellProps,
                              checkable
                          })
                        : undefined;

                    return (
                        <Box
                            key={'bottom-' + (field ?? index.toString())}
                            textAlign={GridAlignGet(align, type)}
                            width={columnWidth(index)}
                        >
                            <Box
                                className="DataGridEx-Cell"
                                onMouseEnter={handleMouseEnter}
                                {...cellProps}
                            >
                                {cell}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    }

    // Destruct
    const {
        alternatingColors = [theme.palette.grey[100], undefined],
        borderRowsCount,
        bottomHeight = 53,
        checkable = false,
        className,
        columns,
        defaultOrderBy,
        height,
        headerHeight = 56,
        headerRenderer = defaultHeaderRenderer,
        footerRenderer = defaultFooterRenderer,
        footerItemRenderer = DataGridRenderers.defaultFooterItemRenderer,
        hideFooter = false,
        hoverColor = '#f6f9fb',
        idField = 'id',
        mRef = React.createRef(),
        selectable = true,
        selectedColor = '#edf4fb',
        width,
        ...rest
    } = props;

    if (checkable) {
        const cbColumn: GridColumn<T> = {
            field: 'selected',
            header: '',
            sortable: false,
            width: 50,
            cellRenderer: ({
                cellProps,
                data,
                selected
            }: GridCellRendererProps<T, BoxProps>) => {
                cellProps.sx = {
                    padding: '4px!important'
                };

                return (
                    <Checkbox
                        color="primary"
                        checked={selected}
                        onChange={(_event, checked) => {
                            state.ref?.selectItem(data, checked);
                        }}
                    />
                );
            },
            headerCellRenderer: ({
                cellProps,
                states
            }: GridHeaderCellRendererProps<T, BoxProps>) => {
                // 2 = border height
                const hpad = (headerHeight - 42) / 2;
                cellProps.sx = {
                    padding: `${hpad}px 4px ${hpad - 1}px 4px!important`
                };

                return (
                    <Checkbox
                        color="primary"
                        indeterminate={
                            states.selectedItems.length > 0 &&
                            states.selectedItems.length < states.rows.length
                        }
                        checked={states.selectedItems.length > 0}
                        onChange={(_event, checked) =>
                            state.ref?.selectAll(checked)
                        }
                    />
                );
            }
        };

        // Update to the latest version
        if (columns[0].field === 'selected') {
            columns[0] = cbColumn;
        } else {
            columns.unshift(cbColumn);
        }
    }

    // States
    const [state, stateUpdate] = React.useReducer(
        (currentState: States, newState: Partial<States>) => {
            return { ...currentState, ...newState };
        },
        {
            gridWidth: width
        }
    );

    const refs = useCombinedRefs(mRef, (ref: ScrollerGridForwardRef) => {
        if (ref == null) return;
        state.ref = ref;
    });

    // New sort
    const handleSort = (field: string, asc?: boolean) => {
        reset({ orderBy: field, orderByAsc: asc });
    };

    const reset = (add: {}) => {
        state.ref?.reset(add);
    };

    // Show hover tooltip for trucated text
    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
        const div = event.currentTarget;
        const { innerText, offsetWidth, scrollWidth } = div;
        if (offsetWidth < scrollWidth) {
            div.title = innerText;
        } else {
            div.title = '';
        }
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        const div = event.currentTarget;
        const row = div.dataset['row'];
        if (div.parentElement == null || row == null) return;

        const rowIndex = parseFloat(row);

        // No change
        if (isNaN(rowIndex) || rowIndex === state.selectedRowIndex) return;

        if (state.selectedRowIndex != null) {
            doRowItems(div.parentElement, state.selectedRowIndex, (preDiv) => {
                preDiv.classList.remove('DataGridEx-Selected');
            });
        }

        rowItems(div, (currentDiv) => {
            currentDiv.classList.add('DataGridEx-Selected');
        });
        state.selectedRowIndex = rowIndex;

        state.ref?.select(state.selectedRowIndex);
    };

    const handleMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
        rowItems(event.currentTarget, (div) => {
            div.classList.add('DataGridEx-Hover');
        });
    };

    const handleMouseOut = (event: React.MouseEvent<HTMLDivElement>) => {
        rowItems(event.currentTarget, (div) => {
            div.classList.remove('DataGridEx-Hover');
        });
    };

    /**
     * Item renderer
     */
    const itemRenderer = ({
        columnIndex,
        rowIndex,
        style,
        data,
        selectedItems
    }: ScrollerGridItemRendererProps<T>) => {
        // Column
        const {
            align,
            cellRenderer = DataGridRenderers.defaultCellRenderer,
            field,
            type,
            valueFormatter,
            renderProps
        } = columns[columnIndex];

        // Props
        const formatProps: GridCellFormatterProps<T> = {
            data,
            field,
            rowIndex,
            columnIndex
        };

        let rowClass = `DataGridEx-Cell${rowIndex % 2}`;
        if (
            borderRowsCount != null &&
            borderRowsCount > 0 &&
            (rowIndex + 1) % borderRowsCount === 0
        ) {
            rowClass += ` DataGridEx-Cell-Border`;
        }

        // Selected
        const selected =
            data != null &&
            idField in data &&
            selectedItems.some(
                (selectedItem) =>
                    selectedItem != null &&
                    selectedItem[idField] === data[idField]
            );

        if (selected) {
            rowClass += ` DataGridEx-Selected`;
        }

        const cellProps: BoxProps = {
            className: 'DataGridEx-Cell',
            textAlign: GridAlignGet(align, type)
        };

        const child = cellRenderer({
            data,
            field,
            formattedValue: valueFormatter
                ? valueFormatter(formatProps)
                : undefined,
            selected,
            type,
            rowIndex,
            columnIndex,
            cellProps,
            renderProps
        });

        return (
            <div
                className={rowClass}
                style={style}
                data-row={rowIndex}
                data-column={columnIndex}
                onMouseDown={
                    selectable && !checkable ? handleMouseDown : undefined
                }
                onMouseOver={selectable ? handleMouseOver : undefined}
                onMouseOut={selectable ? handleMouseOut : undefined}
            >
                <Box {...cellProps} onMouseEnter={handleMouseEnter}>
                    {child}
                </Box>
            </div>
        );
    };

    // Column width calculator
    const widthCalculator = React.useMemo(
        () => DataGridExCalColumns(columns),
        [columns]
    );

    // Grid width
    const { gridWidth } = state;

    // Column width
    const columnWidth = React.useCallback(
        (index: number) => {
            // Ignore null case
            if (gridWidth == null) return 0;

            // Column
            const column = columns[index];
            if (column.width != null) return column.width;

            // More space
            const leftWidth =
                gridWidth -
                widthCalculator.total -
                (gridWidth < 800 ? 0 : scrollbarSize);

            // Shared width
            const sharedWidth =
                leftWidth > 0 ? leftWidth / widthCalculator.unset : 0;

            return (column.minWidth || minWidth) + sharedWidth;
        },
        [columns, gridWidth]
    );

    // Table
    const table = React.useMemo(() => {
        if (gridWidth != null) {
            const defaultOrderByAsc = defaultOrderBy
                ? columns.find((column) => column.field === defaultOrderBy)
                      ?.sortAsc
                : undefined;

            return (
                <ScrollerGrid<T>
                    className={Utils.mergeClasses(
                        'DataGridEx-Body',
                        'DataGridEx-CustomBar',
                        className,
                        createGridStyle(
                            alternatingColors,
                            selectedColor,
                            hoverColor
                        )
                    )}
                    columnCount={columns.length}
                    columnWidth={columnWidth}
                    defaultOrderBy={defaultOrderBy}
                    defaultOrderByAsc={defaultOrderByAsc}
                    height={
                        height -
                        headerHeight -
                        (hideFooter ? 0 : bottomHeight + 1) -
                        scrollbarSize
                    }
                    headerRenderer={headerRenderer}
                    idField={idField}
                    itemRenderer={itemRenderer}
                    footerRenderer={hideFooter ? undefined : footerRenderer}
                    width={Math.max(gridWidth, widthCalculator.total)}
                    mRef={refs}
                    {...rest}
                />
            );
        }
    }, [gridWidth]);

    // Watch container
    const { dimensions } = useDimensions(1, undefined, 50);
    const gridRect = dimensions[0][2];

    const windowSize = useWindowSize(50);

    React.useEffect(() => {
        if (gridRect == null || width != null) return;

        // Reset column widths
        if (state.ref) state.ref.resetAfterColumnIndex(0);

        const body = window.document.body;
        const scrollWidth = body.scrollWidth - body.clientWidth;

        stateUpdate({
            gridWidth: gridRect.width - scrollWidth
        });
    }, [gridRect, windowSize]);

    return (
        <Paper
            ref={dimensions[0][0]}
            sx={{
                fontSize: '0.875rem',
                height,
                '& .DataGridEx-Cell': {
                    padding: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                },
                '& .DataGridEx-CustomBar': {
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
                }
            }}
        >
            <div
                className="DataGridEx-CustomBar"
                style={{
                    width: gridWidth,
                    overflowX: 'auto',
                    overflowY: 'hidden'
                }}
            >
                {table}
            </div>
        </Paper>
    );
}
