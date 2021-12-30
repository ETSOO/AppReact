import { DataTypes } from '@etsoo/shared';
import { Box, Stack } from '@mui/material';
import React from 'react';
import { GridDataGet, GridLoadDataProps } from '../../components/GridLoader';
import { ScrollerListForwardRef } from '../../components/ScrollerList';
import useCombinedRefs from '../../uses/useCombinedRefs';
import { MUGlobal } from '../MUGlobal';
import { ScrollerListEx } from '../ScrollerListEx';
import { SearchBar } from '../SearchBar';
import {
    CommonPage,
    CommonPagePullContainer,
    CommonPageScrollContainer
} from './CommonPage';
import { ListPageProps } from './ListPageProps';

/**
 * List page
 * @param props Props
 * @returns Component
 */
export function ListPage<
    T extends {},
    F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate
>(props: ListPageProps<T, F>) {
    // Destruct
    const {
        fields,
        fieldTemplate,
        loadData,
        mRef,
        pageProps = {},
        ...rest
    } = props;

    pageProps.paddings ??= MUGlobal.pagePaddings;

    // States
    const [states] = React.useState<{
        data?: FormData;
        ref?: ScrollerListForwardRef;
    }>({});

    const refs = useCombinedRefs(mRef, (ref: ScrollerListForwardRef) => {
        if (ref == null) return;

        const first = states.ref == null;

        states.ref = ref;

        if (first) reset();
    });

    const reset = () => {
        if (states.data == null || states.ref == null) return;
        states.ref.reset({ data: states.data });
    };

    // On submit callback
    const onSubmit = (data: FormData, _reset: boolean) => {
        states.data = data;
        reset();
    };

    const localLoadData = (props: GridLoadDataProps) => {
        const data = GridDataGet(props, fieldTemplate);
        return loadData(data);
    };

    // Layout
    return (
        <CommonPage
            {...pageProps}
            scrollContainer={CommonPageScrollContainer}
            pullContainer={CommonPagePullContainer}
        >
            <Stack>
                <Box
                    sx={{
                        paddingBottom: pageProps.paddings
                    }}
                >
                    <SearchBar fields={fields} onSubmit={onSubmit} />
                </Box>
                <ScrollerListEx<T>
                    autoLoad={false}
                    loadData={localLoadData}
                    mRef={refs}
                    {...rest}
                />
            </Stack>
        </CommonPage>
    );
}
