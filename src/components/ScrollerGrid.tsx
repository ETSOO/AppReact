import { DataTypes } from "@etsoo/shared";
import React from "react";
import { Grid, GridImperativeAPI, GridProps, useGridRef } from "react-window";
import {
  GridJsonData,
  GridLoadDataProps,
  GridLoader,
  GridLoaderPartialStates,
  GridLoaderStates
} from "./GridLoader";
import { GridMethodRef, ScrollToRowParam } from "./GridMethodRef";
import { useCombinedRefs } from "../uses/useCombinedRefs";

type ScrollerGridCellrops<T extends object> = {
  rows: T[];
  states: GridLoaderStates<T>;
};

/**
 * Scroller grid forward params
 */
export type ScrollToCellParam = {
  behavior?: ScrollToRowParam["behavior"];
  columnAlign?: ScrollToRowParam["align"];
  columnIndex: number;
  rowAlign?: ScrollToRowParam["align"];
  rowIndex: number;
};

/**
 * Scroller vertical grid props
 */
export type ScrollerGridProps<
  T extends object,
  P extends GridJsonData = GridLoadDataProps
> = GridLoader<T, P> &
  Omit<
    GridProps<ScrollerGridCellrops<T>>,
    "cellProps" | "overscanCount" | "rowCount"
  > & {
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
     * Height of the grid
     */
    height?: number | string;

    /**
     * Id field
     */
    idField?: DataTypes.Keys<T>;

    /**
     * Methods
     */
    mRef?: React.Ref<ScrollerGridForwardRef<T>>;

    /**
     * Handler for init load
     * @param ref Ref
     * @returns Result
     */
    onInitLoad?: (
      ref: GridImperativeAPI
    ) => [T[], GridLoaderPartialStates<T>?] | null | undefined;

    /**
     * On items select change
     */
    onSelectChange?: (selectedItems: T[]) => void;

    /**
     * Width of the grid
     */
    width?: number | string;
  };

/**
 * Scroller grid forward ref
 */
export interface ScrollerGridForwardRef<T> extends GridMethodRef<T> {
  /**
   * Scroll to the cell
   * @param param Parameters to control
   */
  scrollToCell(param: ScrollToCellParam): void;

  /**
   * Scroll to the cell
   * @param param Parameters to control
   */
  scrollToColumn(param: ScrollToRowParam): void;

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
}

/**
 * Scroller vertical grid
 * @param props Props
 * @returns Component
 */
export const ScrollerGrid = <T extends object>(props: ScrollerGridProps<T>) => {
  // Destruct
  const {
    autoLoad = true,
    defaultOrderBy,
    footerRenderer,
    headerRenderer,
    height = "100%",
    gridRef,
    width = "100%",
    style = {},
    idField = "id" as DataTypes.Keys<T>,
    loadBatchSize,
    loadData,
    mRef,
    onCellsRendered,
    onSelectChange,
    rowHeight = 53,
    threshold = 3,
    onInitLoad,
    onUpdateRows,
    ...rest
  } = props;

  // Style
  Object.assign(style, {
    width,
    height,
    overflowX: "hidden"
  });

  // Refs
  const localRef = useGridRef(null);
  const refs = useCombinedRefs(gridRef, localRef);

  // Rows
  const [rows, updateRows] = React.useState<T[]>([]);
  const setRows = (rows: T[], reset: boolean = false) => {
    stateRefs.current.loadedItems = rows.length;
    updateRows(rows);

    if (!reset && onUpdateRows) onUpdateRows(rows, stateRefs.current);
  };

  // State Refs
  const stateRefs = React.useRef<GridLoaderStates<T>>({
    queryPaging: {
      currentPage: 0,
      orderBy: defaultOrderBy,
      batchSize: 10
    },
    autoLoad,
    hasNextPage: true,
    isNextPageLoading: false,
    loadedItems: 0,
    selectedItems: [],
    idCache: {}
  });

  // Load data
  const loadDataLocal = (pageAdd: number = 1) => {
    // Prevent multiple loadings
    if (
      !stateRefs.current.hasNextPage ||
      stateRefs.current.isNextPageLoading ||
      stateRefs.current.isMounted === false
    )
      return;

    // Update state
    stateRefs.current.isNextPageLoading = true;

    // Parameters
    const { queryPaging, data } = stateRefs.current;

    const loadProps: GridLoadDataProps = {
      queryPaging,
      data
    };

    loadData(loadProps, stateRefs.current.lastItem).then((result) => {
      if (result == null || stateRefs.current.isMounted === false) {
        return;
      }
      stateRefs.current.isMounted = true;

      const newItems = result.length;
      stateRefs.current.lastLoadedItems = newItems;
      stateRefs.current.lastItem = result.at(-1);
      stateRefs.current.isNextPageLoading = false;
      stateRefs.current.hasNextPage =
        newItems >= stateRefs.current.queryPaging.batchSize;

      if (pageAdd === 0) {
        // New items
        const newRows = stateRefs.current.lastLoadedItems
          ? [...rows]
              .splice(
                rows.length - stateRefs.current.lastLoadedItems,
                stateRefs.current.lastLoadedItems
              )
              .concat(result)
          : result;

        stateRefs.current.idCache = {};
        for (const row of newRows) {
          const id = row[idField] as any;
          stateRefs.current.idCache[id] = null;
        }

        // Update rows
        setRows(newRows);
      } else {
        // Set current page
        if (stateRefs.current.queryPaging.currentPage == null)
          stateRefs.current.queryPaging.currentPage = pageAdd;
        else stateRefs.current.queryPaging.currentPage += pageAdd;

        // Update rows, avoid duplicate items
        const newRows = [...rows];

        for (const item of result) {
          const id = item[idField] as any;
          if (stateRefs.current.idCache[id] === undefined) {
            newRows.push(item);
          }
        }

        setRows(newRows);
      }
    });
  };

  // Reset the state and load again
  const reset = (add?: GridLoaderPartialStates<T>, items: T[] = []) => {
    const { queryPaging, ...rest } = add ?? {};
    const resetState: GridLoaderPartialStates<T> = {
      autoLoad: true,
      loadedItems: 0,
      hasNextPage: true,
      isNextPageLoading: false,
      lastLoadedItems: undefined,
      lastItem: undefined,
      ...rest
    };
    Object.assign(stateRefs.current, resetState);
    Object.assign(stateRefs.current.queryPaging, {
      currentPage: 0,
      ...queryPaging
    });

    // Reset items
    if (stateRefs.current.isMounted !== false) setRows(items, true);
  };

  React.useImperativeHandle(
    mRef,
    () => ({
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
      scrollToCell(param: ScrollToCellParam): void {
        localRef.current?.scrollToCell(param);
      },
      scrollToColumn(param: ScrollToRowParam): void {
        localRef.current?.scrollToColumn(param);
      },
      scrollToRow(param: ScrollToRowParam): void {
        localRef.current?.scrollToRow(param);
      },
      select(rowIndex: number) {
        // Select only one item
        const selectedItems = stateRefs.current.selectedItems;
        selectedItems[0] = rows[rowIndex];

        if (onSelectChange) onSelectChange(selectedItems);
      },
      selectAll(checked: boolean) {
        const selectedItems = stateRefs.current.selectedItems;

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
        const selectedItems = stateRefs.current.selectedItems;
        const index = selectedItems.findIndex(
          (selectedItem) => selectedItem[idField] === item[idField]
        );

        if (checked) {
          if (index === -1) selectedItems.push(item);
        } else {
          if (index !== -1) selectedItems.splice(index, 1);
        }

        if (onSelectChange) onSelectChange(selectedItems);
      }
    }),
    [rows]
  );

  // Rows
  const rowCount = rows.length;

  React.useEffect(() => {
    // Auto load data when current page is 0
    if (
      stateRefs.current.queryPaging.currentPage === 0 &&
      stateRefs.current.autoLoad
    ) {
      const initItems =
        onInitLoad == null || localRef.current == null
          ? undefined
          : onInitLoad(localRef.current);
      if (initItems) reset(initItems[1], initItems[0]);
      else loadDataLocal();
    }
  }, [onInitLoad, loadDataLocal]);

  React.useEffect(() => {
    return () => {
      stateRefs.current.isMounted = false;
    };
  }, []);

  // Layout
  return (
    <React.Fragment>
      {headerRenderer && headerRenderer(stateRefs.current)}
      <Grid<ScrollerGridCellrops<T>>
        cellProps={{ rows, states: stateRefs.current }}
        gridRef={refs}
        onCellsRendered={(visibleCells, allCells) => {
          // No items, means no necessary to load more data during reset
          if (
            rowCount > 0 &&
            visibleCells.rowStopIndex + threshold > rowCount
          ) {
            // Auto load next page
            loadDataLocal();
          }

          onCellsRendered?.(visibleCells, allCells);
        }}
        overscanCount={threshold}
        rowHeight={rowHeight}
        rowCount={rowCount}
        style={style}
        {...rest}
      />
      {footerRenderer && footerRenderer(rows, stateRefs.current)}
    </React.Fragment>
  );
};
