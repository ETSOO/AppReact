import { DomUtils } from '@etsoo/shared';

/**
 * Grid size
 */
export type GridSize = number | ((input: number) => number);

/**
 * Grid size calculation
 * @param size Size
 * @param input Input
 */
export const GridSizeGet = (size: GridSize, input: number) => {
    if (typeof size === 'function') return size(input);
    return size;
};

/**
 * Grid data type
 */
export type GridData = FormData | Record<string, any>;

/**
 * Grid data get as Json
 * @param data Data
 * @returns Json data
 */
export const GridDataGet = (data?: GridData) => {
    if (data instanceof FormData) {
        // Clear empty value
        DomUtils.clearFormData(data);

        // Transfer to Json
        return DomUtils.formDataToObject(data);
    }

    return data;
};

/**
 * Grid Json data
 */
export interface GridJsonData
    extends Omit<GridLoadDataProps, 'data'>,
        Record<string, any> {}

/**
 * Grid data load props
 */
export interface GridLoadDataProps {
    /**
     * Current page
     */
    currentPage: number;

    /**
     * Load batch size
     */
    batchSize: number;

    /**
     * Current order field
     */
    orderBy?: string;

    /**
     * Order ascending or not?
     */
    orderByAsc?: boolean;

    /**
     * Data related
     */
    data?: GridData;
}

/**
 * Grid data loader
 */
export interface GridLoader<T> {
    /**
     * Auto load data, otherwise call reset
     * @default true
     */
    autoLoad?: boolean;

    /**
     * Default order by
     */
    defaultOrderBy?: string;

    /**
     * Batch size when load data, default will be calcuated with height and itemSize
     */
    loadBatchSize?: GridSize;

    /**
     * Load data
     */
    loadData: (props: GridLoadDataProps) => PromiseLike<T[] | null | undefined>;

    /**
     * Threshold at which to pre-fetch data; default is half of loadBatchSize
     */
    threshold?: number | undefined;
}

/**
 * Grid loader states
 */
export interface GridLoaderStates<T> extends GridLoadDataProps {
    /**
     * Auto load data, otherwise call reset
     * @default true
     */
    autoLoad: boolean;

    /**
     * Last loaded items
     */
    lastLoadedItems?: number;

    /**
     * Has next page?
     */
    hasNextPage: boolean;

    /**
     * Is next page loading?
     */
    isNextPageLoading: boolean;

    /**
     * Mounted or not
     */
    mounted?: boolean;

    /**
     * Current rows
     */
    rows: T[];

    /**
     * Selected items of id
     */
    selectedItems: T[];
}
