import { DataTypes, Utils } from "@etsoo/shared";
import React from "react";
import { List, ListImperativeAPI, ListProps, useListRef } from "react-window";
import { useCombinedRefs } from "../uses/useCombinedRefs";
import {
  GridLoadDataProps,
  GridLoader,
  GridLoaderPartialStates,
  GridLoaderStates
} from "./GridLoader";
import { GridMethodRef, ScrollToRowParam } from "./GridMethodRef";

type ScrollerListRowProps<T extends object> = {
  items: T[];
};

/**
 * On rows rendered data
 */
export type OnRowsRenderedData = Parameters<
  NonNullable<ListProps<object>["onRowsRendered"]>
>[0];

/**
 * Scroller list forward ref
 */
export interface ScrollerListForwardRef<T> extends GridMethodRef<T> {}

/**
 * Scroller vertical list props
 */
export type ScrollerListProps<T extends object> = GridLoader<T> &
  Omit<
    ListProps<ScrollerListRowProps<T>>,
    "rowCount" | "rowProps" | "overscanCount"
  > & {
    /**
     * Height of the list
     */
    height?: number | string;

    /**
     * Id field
     */
    idField?: DataTypes.Keys<T>;

    /**
     * Methods ref
     */
    mRef?: React.Ref<ScrollerListForwardRef<T>>;

    /**
     * Handler for init load
     * @param ref Ref
     * @returns Result
     */
    onInitLoad?: (
      ref: ListImperativeAPI
    ) => [T[], GridLoaderPartialStates<T>?] | null | undefined;

    /**
     * Width of the list
     */
    width?: number | string;
  };

// Calculate loadBatchSize
const calculateBatchSize = (height: unknown, rowHeight: unknown) => {
  if (
    typeof height === "number" &&
    typeof rowHeight === "number" &&
    rowHeight > 0
  ) {
    return 1 + Math.ceil(height / rowHeight);
  }

  return 10;
};

/**
 * Scroller vertical list
 * @param props Props
 * @returns Component
 */
export const ScrollerList = <T extends object>(props: ScrollerListProps<T>) => {
  // Destruct
  const {
    autoLoad = true,
    defaultOrderBy,
    height = "100%",
    width = "100%",
    mRef,
    style = {},
    idField = "id" as DataTypes.Keys<T>,
    rowHeight,
    listRef,
    loadBatchSize = calculateBatchSize(height, rowHeight),
    loadData,
    threshold = 3,
    onRowsRendered,
    onInitLoad,
    onUpdateRows,
    ...rest
  } = props;

  // Style
  Object.assign(style, {
    width,
    height
  });

  const localRef = useListRef(null);
  const refs = useCombinedRefs(listRef, localRef);

  const [rows, updateRows] = React.useState<T[]>([]);

  const setRows = (rows: T[], reset: boolean = false) => {
    stateRefs.current.loadedItems = rows.length;
    updateRows(rows);

    onUpdateRows?.(rows, stateRefs.current, reset);
  };

  const batchSize = Utils.getResult<number>(loadBatchSize, height);

  const stateRefs = React.useRef<GridLoaderStates<T>>({
    queryPaging: {
      currentPage: 0,
      orderBy: defaultOrderBy,
      batchSize
    },
    autoLoad,
    loadedItems: 0,
    hasNextPage: true,
    isNextPageLoading: false,
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
      stateRefs.current.hasNextPage = newItems >= batchSize;
      stateRefs.current.isNextPageLoading = false;

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

    // Reset
    if (stateRefs.current.isMounted !== false) setRows(items, true);
  };

  React.useImperativeHandle(
    mRef,
    () => {
      return {
        get element() {
          return localRef.current?.element;
        },
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

        scrollToRow(param: ScrollToRowParam): void {
          localRef.current?.scrollToRow(param);
        }
      };
    },
    []
  );

  // When layout ready
  React.useEffect(() => {
    // Return clear function
    return () => {
      stateRefs.current.isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    // Auto load data when current page is 0
    if (
      stateRefs.current.queryPaging?.currentPage === 0 &&
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

  // Row count
  const rowCount = rows.length;

  // Layout
  return (
    <List<ScrollerListRowProps<T>>
      listRef={refs}
      onRowsRendered={(visibleCells, allCells) => {
        // No items, means no necessary to load more data during reset
        if (rowCount > 0 && visibleCells.stopIndex + threshold > rowCount) {
          // Auto load next page
          loadDataLocal();
        }

        onRowsRendered?.(visibleCells, allCells);
      }}
      overscanCount={threshold}
      rowHeight={rowHeight}
      rowCount={rowCount}
      rowProps={{ items: rows }}
      style={style}
      {...rest}
    />
  );
};
