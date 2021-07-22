import { DomUtils } from '@etsoo/shared';
import { Box, Stack } from '@material-ui/core';
import React from 'react';
import {
    ScrollerList,
    ScrollerListForwardRef
} from '../../components/ScrollerList';
import { MUGlobal } from '../MUGlobal';
import { SearchBar } from '../SearchBar';
import { CommonPage } from './CommonPage';
import { itemKey, ListPageForwardRef, ListPageProps } from './ListPageTypes';

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
        itemRenderer,
        itemSize,
        loadData,
        mRef,
        paddings = MUGlobal.pagePaddings,
        ...rest
    } = props;

    // States
    const [states] = React.useState<{
        data?: FormData;
        ref?: ScrollerListForwardRef;
    }>({});

    // On submit callback
    const onSubmit = (data: FormData, _reset: boolean) => {
        states.data = data;
        methods.reset();
    };

    // On list load data
    const listLoadData = async (page: number, loadBatchSize: number) => {
        // Form data
        const data = states.data;
        if (data == null) return;

        // Clear empty value
        DomUtils.clearFormData(data);

        // Load data
        return await loadData(data, page, loadBatchSize);
    };

    // Methods
    const methods = React.useMemo(() => {
        return {
            /**
             * Refresh latest page data
             */
            refresh(): void {
                states.ref?.refresh();
            },

            /**
             * Refresh data
             */
            reset(): void {
                if (states.ref == null || states.data == null) return;
                states.ref.reset();
            }
        };
    }, [states]);

    React.useImperativeHandle(mRef, () => methods, [states]);

    // Layout
    return (
        <CommonPage
            {...rest}
            paddings={paddings}
            scrollContainer={global}
            pullContainer="#page-container"
        >
            <Stack>
                <Box
                    sx={{
                        paddingBottom: paddings
                    }}
                >
                    <SearchBar fields={fields} onSubmit={onSubmit} />
                </Box>
                <ScrollerList<T>
                    loadBatchSize={loadBatchSize}
                    itemRenderer={itemRenderer}
                    itemSize={itemSize}
                    itemKey={itemKey}
                    loadData={listLoadData}
                    mRef={(ref) => {
                        if (ref == null) return;
                        states.ref = ref;
                        methods.reset();
                    }}
                />
            </Stack>
        </CommonPage>
    );
}
