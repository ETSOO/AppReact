import { ListChildComponentProps } from 'react-window';
import { CommonPageProps } from './CommonPage';

/**
 * List page props
 */
export interface ListPageProps<T> extends CommonPageProps {
    /**
     * Batch size when load data, default is 10
     */
    loadBatchSize?: number;

    /**
     * Fields
     */
    fields: React.ReactElement[];

    /**
     * Item renderer
     */
    itemRenderer: (itemProps: ListChildComponentProps<T>) => React.ReactElement;

    /**
     * List item size
     */
    itemSize: ((index: number) => number) | number;

    /**
     * Load data callback
     */
    loadData: (
        data: FormData,
        page: number,
        loadBatchSize: number
    ) => PromiseLike<T[] | null | undefined>;
}

/**
 * List page forward ref
 */
export interface ListPageForwardRef {
    /**
     * Refresh data
     */
    refresh(): void;

    /**
     * Reset data
     */
    reset(): void;
}

/**
 * Default item key
 * @param index Index
 * @param data Data
 * @returns id
 */
export const itemKey = (index: number, data: any) => {
    if (data != null && 'id' in data) {
        return data['id'];
    }

    return index;
};
