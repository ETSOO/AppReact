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
 * List page
 * @param props Props
 * @returns Component
 */
export function ListPage<T>(props: ListPageProps<T>) {
    // Destruct
    const {
        loadBatchSize = 10,
        fields,
        gap = 2,
        itemRenderer,
        listItemSize,
        loadData,
        ...rest
    } = props;

    // Refs
    const listRef = React.createRef<ScrollerListForwardRef>();

    // States
    const [states] = React.useState<{ data?: FormData }>({});

    // On submit callback
    const onSubmit = (data: FormData, _reset: boolean) => {
        states.data = data;
        listRef.current?.reset(true);
    };

    // On list load data
    const listLoadData = async (page: number, loadBatchSize: number) => {
        if (states.data == null) return;
        return await loadData(states.data, page, loadBatchSize);
    };

    // Item key
    const itemKey = (index: number, data: T) => {
        if (data != null && 'id' in data) {
            return (data as any)['id'];
        }

        return index;
    };

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
