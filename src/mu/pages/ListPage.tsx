import { Utils } from '@etsoo/shared';
import { Stack } from '@material-ui/core';
import React from 'react';
import { ListChildComponentProps } from 'react-window';
import {
    ScrollerList,
    ScrollerListForwardRef
} from '../../components/ScrollerList';
import { SearchBar } from '../SearchBar';
import { CommonPage, CommonPageProps } from './CommonPage';

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
     * Search part and content gap
     */
    gap?: number;

    /**
     * Item renderer
     */
    itemRenderer: (itemProps: ListChildComponentProps<T>) => React.ReactElement;

    /**
     * List item size
     */
    listItemSize: ((index: number) => number) | number;

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
 * List page
 * @param props Props
 * @returns Component
 */
export function ListPage<T>(
    props: ListPageProps<T> & { mRef?: React.Ref<ListPageForwardRef> }
) {
    // Destruct
    const {
        loadBatchSize,
        fields,
        gap = 2,
        itemRenderer,
        listItemSize,
        loadData,
        mRef,
        ...rest
    } = props;

    // Refs
    const listRef = React.createRef<ScrollerListForwardRef>();

    // States
    const [states] = React.useState<{ data?: FormData }>({});

    // On submit callback
    const onSubmit = (data: FormData, _reset: boolean) => {
        states.data = data;
        listRef.current?.reset();
    };

    // On list load data
    const listLoadData = async (page: number, loadBatchSize: number) => {
        const data = states.data;
        if (data == null) return;

        // Clear empty value
        Utils.clearFormData(data);

        // Load data
        return await loadData(data, page, loadBatchSize);
    };

    // Item key
    const itemKey = (index: number, data: T) => {
        if (data != null && 'id' in data) {
            return (data as any)['id'];
        }

        return index;
    };

    React.useImperativeHandle(mRef, () => {
        return {
            /**
             * Refresh latest page data
             */
            refresh(): void {
                listRef.current?.refresh();
            },

            /**
             * Refresh data
             */
            reset(): void {
                listRef.current?.reset();
            }
        };
    });

    // Layout
    return (
        <CommonPage {...rest}>
            <Stack spacing={gap}>
                <SearchBar fields={fields} onSubmit={onSubmit} />
                <ScrollerList<T>
                    loadBatchSize={loadBatchSize}
                    itemRenderer={itemRenderer}
                    itemSize={listItemSize}
                    itemKey={itemKey}
                    loadData={listLoadData}
                    mRef={listRef}
                />
            </Stack>
        </CommonPage>
    );
}
