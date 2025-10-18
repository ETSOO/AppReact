import { QueryPagingData, QueryPagingOrder } from "@etsoo/appscript";
import { DataTypes, DomUtils } from "@etsoo/shared";

/**
 * Grid size
 */
export type GridSize = number | ((input: number | string) => number);

/**
 * Grid size calculation
 * @param size Size
 * @param input Input
 */
export const GridSizeGet = (size: GridSize, input: number) => {
  if (typeof size === "function") return size(input);
  return size;
};

/**
 * Grid data type
 */
export type GridData = FormData | DataTypes.StringRecord;

/**
 * Grid template type
 */
export type GridTemplateType<T> = DataTypes.BasicTemplateType<{
  [k in keyof T]: T[k] extends "date"
    ? "date" | "string"
    : T[k] extends DataTypes.BasicNames
    ? T[k]
    : never;
}>;

/**
 * Grid data get with format
 * @param data Data
 * @param template Template
 * @param keepSource Keep source data
 * @returns Json data
 */
export function GridDataGet<const T>(
  props: GridLoadDataProps,
  template?: T,
  keepSource?: boolean
): GridJsonData & GridTemplateType<T> {
  // Destruct
  const { data, ...rest } = props;

  // DomUtils.dataAs(data, template);
  return { ...GridDataGetData<T>(data, template, keepSource), ...rest };
}

/**
 * Grid data get with format
 * @param data Data
 * @param template Template
 * @param keepSource Keep source data
 * @returns Json data
 */
export function GridDataGetData<const T>(
  data?: GridData,
  template?: T,
  keepSource?: boolean
): GridTemplateType<T> {
  // Clear form empty value
  if (data instanceof FormData) {
    DomUtils.clearFormData(data);
  }

  // Conditions
  // Set keepSource to true to hold form data, even they are invisible from the conditions
  const conditions =
    data == null
      ? {}
      : DomUtils.dataAs(data, template as DataTypes.BasicTemplate, keepSource);

  return conditions as any;
}

/**
 * Grid Json data
 */
export type GridJsonData = {
  /**
   * Query paging data
   */
  queryPaging: QueryPagingData;
};

/**
 * Grid data load props
 */
export type GridLoadDataProps = GridJsonData & {
  /**
   * Data related
   */
  data?: GridData;
};

/**
 * Grid data load partial props
 */
export type GridLoadDataPartialProps = {
  /**
   * Query paging data
   */
  queryPaging?: Partial<QueryPagingData>;

  /**
   * Data related
   */
  data?: GridData;
};

/**
 * Grid data loader
 */
export type GridLoader<
  T extends object,
  P extends GridJsonData = GridLoadDataProps
> = {
  /**
   * Auto load data, otherwise call reset
   * @default true
   */
  autoLoad?: boolean;

  /**
   * Default order by
   */
  defaultOrderBy?: QueryPagingOrder[];

  /**
   * Batch size when load data, default will be calcuated with height and rowHeight
   */
  loadBatchSize?: GridSize;

  /**
   * Load data
   */
  loadData: (props: P, lastItem?: T) => PromiseLike<T[] | null | undefined>;

  /**
   * Handler for updating rows
   * @param rows Rows
   * @param state State
   */
  onUpdateRows?: (
    rows: T[],
    state: GridLoaderStates<T>,
    reset: boolean
  ) => void;

  /**
   * Threshold at which to pre-fetch data; default is half of loadBatchSize
   */
  threshold?: number | undefined;
};

type GridLoaderProps<T> = {
  /**
   * Auto load data, otherwise call reset
   * @default true
   */
  autoLoad: boolean;

  /**
   * Last loaded item
   */
  lastItem?: T;

  /**
   * Last loaded items
   */
  lastLoadedItems?: number;

  /**
   * All loaded items count
   */
  loadedItems: number;

  /**
   * Has next page?
   */
  hasNextPage: boolean;

  /**
   * Is next page loading?
   */
  isNextPageLoading: boolean;

  /**
   * Is mounted
   */
  isMounted?: boolean;

  /**
   * Selected items of id
   */
  selectedItems: T[];

  /**
   * Id cache
   */
  idCache: Record<any, null>;
};

/**
 * Grid loader states
 */
export type GridLoaderStates<T> = GridLoadDataProps & GridLoaderProps<T>;

/**
 * Grid loader states
 */
export type GridLoaderPartialStates<T> = GridLoadDataPartialProps &
  Partial<GridLoaderProps<T>>;
