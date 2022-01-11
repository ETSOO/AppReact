import { DataTypes, DomUtils } from '@etsoo/shared';

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
export type GridData = FormData | DataTypes.StringRecord;

/**
 * Grid data get with format
 * @param data Data
 * @returns Json data
 */
export function GridDataGet<F extends DataTypes.BasicTemplate>(
    props: GridLoadDataProps,
    template?: F
): GridJsonData & DataTypes.BasicTemplateType<F> {
    // Destruct
    const { data, ...rest } = props;

    // Clear form empty value
    if (data instanceof FormData) {
        DomUtils.clearFormData(data);
    }

    // Conditions
    const conditions: DataTypes.BasicTemplateType<F> =
        data == null ? {} : DomUtils.dataAs(data, template ?? {}, true); // Set keepSource to true to hold form data, even they are invisible from the conditions

    // DomUtils.dataAs(data, template);
    return { ...conditions, ...rest };
}

/**
 * Grid Json data
 */
export interface GridJsonData extends Omit<GridLoadDataProps, 'data'> {}

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
}
