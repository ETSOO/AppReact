import { DataTypes } from '@etsoo/shared';
import { Box, Stack } from '@mui/material';
import React from 'react';
import { GridDataGet, GridLoadDataProps } from '../../components/GridLoader';
import useCombinedRefs from '../../uses/useCombinedRefs';
import { useDimensions } from '../../uses/useDimensions';
import { MUGlobal } from '../MUGlobal';
import { SearchBar } from '../SearchBar';
import { TableEx, TableExMethodRef, TableExMinWidth } from '../TableEx';
import {
    CommonPage,
    CommonPagePullContainer,
    CommonPageScrollContainer
} from './CommonPage';
import { TablePageProps } from './TablePageProps';

/**
 * Table page
 * @param props Props
 * @returns Component
 */
export function TablePage<
    T extends {},
    F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate
>(props: TablePageProps<T, F>) {
    // Destruct
    const {
        columns,
        fields,
        fieldTemplate,
        loadData,
        mRef,
        sizeReadyMiliseconds = 0,
        pageProps = {},
        ...rest
    } = props;

    pageProps.paddings ??= MUGlobal.pagePaddings;

    // States
    const [states] = React.useState<{
        data?: FormData;
        ref?: TableExMethodRef;
    }>({});

    const refs = useCombinedRefs(mRef, (ref: TableExMethodRef) => {
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

    // Total width
    const totalWidth = React.useMemo(
        () =>
            columns.reduce((previousValue, { width, minWidth }) => {
                return previousValue + (width ?? minWidth ?? TableExMinWidth);
            }, 0),
        [columns]
    );

    // Watch container
    const { dimensions } = useDimensions(1, undefined, sizeReadyMiliseconds);
    const rect = dimensions[0][2];
    const list = React.useMemo(() => {
        if (rect != null && rect.height > 50 && rect.width >= totalWidth) {
            let maxHeight = window.innerHeight - (rect.top + rect.height + 1);

            const style = window.getComputedStyle(dimensions[0][1]!);
            const paddingBottom = parseFloat(style.paddingBottom);
            if (!isNaN(paddingBottom)) maxHeight -= paddingBottom;

            return (
                <TableEx<T>
                    autoLoad={false}
                    columns={columns}
                    loadData={localLoadData}
                    maxHeight={maxHeight}
                    mRef={refs}
                    {...rest}
                />
            );
        }
    }, [rect]);

    // Layout
    return (
        <CommonPage
            {...pageProps}
            scrollContainer={CommonPageScrollContainer}
            pullContainer={CommonPagePullContainer}
        >
            <Stack>
                <Box
                    ref={dimensions[0][0]}
                    sx={{
                        paddingBottom: pageProps.paddings
                    }}
                >
                    <SearchBar fields={fields} onSubmit={onSubmit} />
                </Box>
                {list}
            </Stack>
        </CommonPage>
    );
}
