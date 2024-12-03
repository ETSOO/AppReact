import { DataTypes, Utils } from "@etsoo/shared";
import React from "react";
import {
  Align,
  FixedSizeList,
  ListChildComponentProps,
  ListOnItemsRenderedProps,
  ListProps,
  VariableSizeList
} from "react-window";
import { useCombinedRefs } from "../uses/useCombinedRefs";
import {
  GridLoadDataProps,
  GridLoader,
  GridLoaderPartialStates,
  GridLoaderStates,
  GridSizeGet
} from "./GridLoader";
import { GridMethodRef } from "./GridMethodRef";

/**
 * Scroller vertical list props
 */
export interface ScrollerListProps<T extends object>
  extends GridLoader<T>,
    Omit<
      ListProps<T>,
      "outerRef" | "height" | "width" | "children" | "itemCount" // Exclude these props, shoud be exisited otherwise will be failed
    > {
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
  idField?: DataTypes.Keys<T>;

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
export const ScrollerList = <T extends object>(props: ScrollerListProps<T>) => {
  // Destruct
  const {
    autoLoad = true,
    defaultOrderBy,
    height = document.documentElement.clientHeight,
    width = "100%",
    mRef,
    oRef,
    style = {},
    idField = "id" as DataTypes.Keys<T>,
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
    width: "100%",
    height: "100%",
    display: "inline-block"
  });

  // Refs
  const listRef = React.useRef<any>();
  const outerRef = React.useRef<HTMLDivElement>();

  const refs = useCombinedRefs(oRef, outerRef);

  // Rows
  const [rows, updateRows] = React.useState<T[]>([]);
  const setRows = (rows: T[], reset: boolean = false) => {
    stateRefs.current.loadedItems = rows.length;
    updateRows(rows);

    if (!reset && onUpdateRows) onUpdateRows(rows, stateRefs.current);
  };

  // States
  const batchSize = GridSizeGet(loadBatchSize, height);
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
    if (!stateRefs.current.hasNextPage || stateRefs.current.isNextPageLoading)
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

  const itemRendererLocal = (itemProps: ListChildComponentProps<T>) => {
    // Custom render
    return itemRenderer({
      ...itemProps,
      data: rows[itemProps.index]
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
      stateRefs.current.isMounted = false;
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
  const itemCount = stateRefs.current.hasNextPage ? rowCount + 1 : rowCount;

  // Auto load data when current page is 0
  if (
    stateRefs.current.queryPaging?.currentPage === 0 &&
    stateRefs.current.autoLoad
  ) {
    const initItems =
      onInitLoad == null ? undefined : onInitLoad(listRef.current);
    if (initItems) reset(initItems[1], initItems[0]);
    else loadDataLocal();
  }

  // Layout
  return typeof itemSize === "function" ? (
    <VariableSizeList<T>
      height={height}
      width={width}
      itemCount={itemCount}
      itemKey={(index, data) => DataTypes.getIdValue1(data, idField) ?? index}
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
      itemKey={(index, data) => DataTypes.getIdValue1(data, idField) ?? index}
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
