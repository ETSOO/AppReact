import { DomUtils } from '@etsoo/shared';
import { Box, Stack } from '@material-ui/core';
import React from 'react';
import {
    ScrollerList,
    ScrollerListForwardRef
} from '../../components/ScrollerList';
import { useDimensions } from '../../uses/useDimensions';
import { MUGlobal } from '../MUGlobal';
import { SearchBar } from '../SearchBar';
import { CommonPage } from './CommonPage';
import { itemKey, ListPageForwardRef, ListPageProps } from './ListPageTypes';

/**
 * Fixed height list page
 * @param props Props
 * @returns Component
 */
export function FixedListPage<T>(
    props: ListPageProps<T> & {
        mRef?: React.Ref<ListPageForwardRef>;
        adjustHeight?: (height: number) => number;
    }
) {
    // Destruct
    const {
        adjustHeight,
        loadBatchSize,
        fields,
        itemRenderer,
        itemSize,
        loadData,
        mRef,
        paddings = MUGlobal.pagePaddings,
        ...rest
    } = props;

    // Refs
    const listRef = React.createRef<ScrollerListForwardRef>();

    // States
    const [states] = React.useState<{ data?: FormData }>({});

    // Scroll container
    const [scrollContainer, updateScrollContainer] = React.useState<
        HTMLElement | undefined
    >();

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
        DomUtils.clearFormData(data);

        // Load data
        return await loadData(data, page, loadBatchSize);
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

    // Watch container
    const { dimensions } = useDimensions(1);
    const rect = dimensions[0][2];
    const list = React.useMemo(() => {
        if (rect != null && rect.height > 50) {
            let height =
                window.innerHeight - Math.round(rect.top + rect.height + 1);

            if (adjustHeight != null) {
                height += adjustHeight(height);
            }

            return (
                <Box
                    sx={{
                        height: height + 'px'
                    }}
                >
                    <ScrollerList<T>
                        loadBatchSize={loadBatchSize}
                        height={height}
                        itemRenderer={itemRenderer}
                        itemSize={itemSize}
                        itemKey={itemKey}
                        loadData={listLoadData}
                        mRef={listRef}
                        oRef={(element) => {
                            if (element != null) updateScrollContainer(element);
                        }}
                    />
                </Box>
            );
        }
    }, [rect]);

    // Layout
    return (
        <CommonPage {...rest} paddings={{}} scrollContainer={scrollContainer}>
            <Stack>
                <Box ref={dimensions[0][0]} sx={{ padding: paddings }}>
                    <SearchBar fields={fields} onSubmit={onSubmit} />
                </Box>
                {list}
            </Stack>
        </CommonPage>
    );
}
