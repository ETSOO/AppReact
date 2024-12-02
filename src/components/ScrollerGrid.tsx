import { DataTypes } from "@etsoo/shared";
import React from "react";
import {
  Align,
  GridChildComponentProps,
  GridOnItemsRenderedProps,
  VariableSizeGrid,
  VariableSizeGridProps
} from "react-window";
import {
  GridLoadDataProps,
  GridLoader,
  GridLoaderPartialStates,
  GridLoaderStates
} from "./GridLoader";
import { GridMethodRef } from "./GridMethodRef";

export type ScrollerGridItemRendererProps<T> = Omit<
  GridChildComponentProps<T>,
  "data"
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
export interface ScrollerGridProps<T extends object>
  extends GridLoader<T>,
    Omit<VariableSizeGridProps<T>, "children" | "rowCount" | "rowHeight"> {
  /**
   * Footer renderer
   */
  footerRenderer?: (rows: T[], states: GridLoaderStates<T>) => React.ReactNode;

  /**
   * Header renderer
   */
  headerRenderer?: (states: GridLoaderStates<T>) => React.ReactNode;

  /**
   * Id field
   */
  idField?: DataTypes.Keys<T>;

  /**
   * Item renderer
   */
  itemRenderer: (props: ScrollerGridItemRendererProps<T>) => React.ReactElement;

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
}

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
export const ScrollerGrid = <T extends object>(props: ScrollerGridProps<T>) => {
  // Destruct
  const {
    autoLoad = true,
    defaultOrderBy,
    footerRenderer,
    headerRenderer,
    itemRenderer,
    idField = "id" as DataTypes.Keys<T>,
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
    refs.current.loadedItems = rows.length;
    updateRows(rows);

    if (!reset && onUpdateRows) onUpdateRows(rows, refs.current);
  };

  // Refs
  const refs = React.useRef<GridLoaderStates<T>>({
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

  const ref = React.useRef<VariableSizeGrid<T>>(null);

  // Load data
  const loadDataLocal = (pageAdd: number = 1) => {
    // Prevent multiple loadings
    if (!refs.current.hasNextPage || refs.current.isNextPageLoading) return;

    // Update state
    refs.current.isNextPageLoading = true;

    // Parameters
    const { queryPaging, data } = refs.current;

    const loadProps: GridLoadDataProps = {
      queryPaging,
      data
    };

    loadData(loadProps, refs.current.lastItem).then((result) => {
      if (result == null || refs.current.isMounted === false) {
        return;
      }
      refs.current.isMounted = true;

      const newItems = result.length;
      refs.current.lastLoadedItems = newItems;
      refs.current.lastItem = result.at(-1);
      refs.current.isNextPageLoading = false;
      refs.current.hasNextPage = newItems >= refs.current.queryPaging.batchSize;

      if (pageAdd === 0) {
        // New items
        const newRows = refs.current.lastLoadedItems
          ? [...rows]
              .splice(
                rows.length - refs.current.lastLoadedItems,
                refs.current.lastLoadedItems
              )
              .concat(result)
          : result;

        refs.current.idCache = {};
        for (const row of newRows) {
          const id = row[idField] as any;
          refs.current.idCache[id] = null;
        }

        // Update rows
        setRows(newRows);
      } else {
        // Set current page
        if (refs.current.queryPaging.currentPage == null)
          refs.current.queryPaging.currentPage = pageAdd;
        else refs.current.queryPaging.currentPage += pageAdd;

        // Update rows, avoid duplicate items
        const newRows = [...rows];

        for (const item of result) {
          const id = item[idField] as any;
          if (refs.current.idCache[id] === undefined) {
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
      itemProps.rowIndex < rows.length ? rows[itemProps.rowIndex] : undefined;
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
    if (itemCount > 0 && props.visibleRowStopIndex + threshold > itemCount) {
      // Auto load next page
      loadDataLocal();
    }

    // Custom
    if (onItemsRendered) onItemsRendered(props);
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
      ...rest
    };
    Object.assign(refs.current, resetState);
    Object.assign(refs.current.queryPaging, {
      currentPage: 0,
      ...queryPaging
    });

    // Reset items
    if (refs.current.isMounted !== false) setRows(items, true);
  };

  const instance: ScrollerGridForwardRef<T> = {
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
    scrollToRef(scrollOffset: number): void {
      ref.current?.scrollTo({ scrollLeft: 0, scrollTop: scrollOffset });
    },

    scrollToItemRef(index: number, align?: Align): void {
      ref.current?.scrollToItem({ rowIndex: index, align });
    },
    select(rowIndex: number) {
      // Select only one item
      const selectedItems = refs.current.selectedItems;
      selectedItems[0] = rows[rowIndex];

      if (onSelectChange) onSelectChange(selectedItems);
    },
    selectAll(checked: boolean) {
      const selectedItems = refs.current.selectedItems;

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
      const selectedItems = refs.current.selectedItems;
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
      refs.current.isMounted = false;
    };
  }, []);

  // Force update to work with the new width and rowHeight
  React.useEffect(() => {
    ref.current?.resetAfterIndices({
      columnIndex: 0,
      rowIndex: 0,
      shouldForceUpdate: true
    });
  }, [width, rowHeight]);

  // Rows
  const rowLength = rows.length;

  // Row count
  const rowCount = refs.current.hasNextPage ? rowLength + 1 : rowLength;

  // Auto load data when current page is 0
  if (refs.current.queryPaging.currentPage === 0 && refs.current.autoLoad) {
    const initItems = onInitLoad == null ? undefined : onInitLoad(ref.current);
    if (initItems) reset(initItems[1], initItems[0]);
    else loadDataLocal();
  }

  // Layout
  return (
    <React.Fragment>
      {headerRenderer && headerRenderer(refs.current)}
      <VariableSizeGrid<T>
        itemKey={({ columnIndex, rowIndex, data }) => {
          if (data == null) return [rowIndex, columnIndex].join(",");
          // ${data[idField]}-${rowIndex} always unique but no cache for the same item
          return [`${data[idField]}`, columnIndex].join(",");
        }}
        onItemsRendered={onItemsRenderedLocal}
        ref={ref}
        rowCount={rowCount}
        rowHeight={
          typeof rowHeight === "function" ? rowHeight : () => rowHeight
        }
        style={{ overflowX: "hidden" }}
        width={width}
        {...rest}
      >
        {(props) => itemRendererLocal(props, refs.current)}
      </VariableSizeGrid>
      {footerRenderer && footerRenderer(rows, refs.current)}
    </React.Fragment>
  );
};
