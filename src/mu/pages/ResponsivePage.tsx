import { Box, Stack } from '@mui/material';
import React from 'react';
import { GridDataGet, GridLoadDataProps } from '../../components/GridLoader';
import useCombinedRefs from '../../uses/useCombinedRefs';
import { useDimensions } from '../../uses/useDimensions';
import { DataGridEx, DataGridExCalColumns } from '../DataGridEx';
import { GridMethodRef } from '../GridMethodRef';
import { MUGlobal } from '../MUGlobal';
import { ScrollerListEx } from '../ScrollerListEx';
import { SearchBar } from '../SearchBar';
import { CommonPage } from './CommonPage';
import { ResponsePageProps } from './ResponsivePageProps';

interface LocalStates {
    data?: FormData;
    element?: HTMLElement;
    height?: number;
    ref?: GridMethodRef;
}

/**
 * Fixed height list page
 * @param props Props
 * @returns Component
 */
export function ResponsivePage<T>(props: ResponsePageProps<T>) {
    // Destruct
    const {
        adjustHeight,
        columns,
        dataGridMinWidth = DataGridExCalColumns(columns).total,
        fields,
        height,
        loadData,
        innerItemRenderer,
        itemSize,
        mRef,
        pageProps = {},
        ...rest
    } = props;

    pageProps.paddings ??= MUGlobal.pagePaddings;

    // States
    const [states, setStates] = React.useReducer(
        (currentState: LocalStates, newState: Partial<LocalStates>) => {
            return { ...currentState, ...newState };
        },
        {
            height
        }
    );

    const localLoadData = ({ data, ...rest }: GridLoadDataProps) => {
        const json = GridDataGet(data);
        return loadData({ ...json, ...rest });
    };

    const refs = useCombinedRefs(mRef, (ref: GridMethodRef) => {
        if (ref == null) return;
        states.ref = ref;
        // setStates({ ref });
    });

    // On submit callback
    const onSubmit = (data: FormData, _reset: boolean) => {
        setStates({ data });
    };

    // Watch container
    const { dimensions } = useDimensions(1, undefined, 50);
    const rect = dimensions[0][2];
    const showDataGrid = (rect?.width ?? 0) >= dataGridMinWidth;

    React.useEffect(() => {
        if (rect != null && rect.height > 50 && height == null) {
            let gridHeight =
                window.innerHeight - Math.round(rect.top + rect.height + 1);

            const style = window.getComputedStyle(dimensions[0][1]!);
            const paddingBottom = parseFloat(style.paddingBottom);
            if (!isNaN(paddingBottom)) gridHeight -= paddingBottom;

            if (adjustHeight != null) {
                gridHeight -= adjustHeight(gridHeight);
            }

            if (gridHeight !== states.height) setStates({ height: gridHeight });
        }
    }, [rect]);

    const { paddings, ...pageRest } = pageProps;

    const list = React.useMemo(() => {
        const gridHeight = states.height;
        if (gridHeight == null) return;

        if (showDataGrid) {
            // Delete
            delete rest.itemRenderer;

            return (
                <Box
                    sx={{
                        paddingLeft: paddings,
                        paddingRight: paddings,
                        paddingBottom: paddings
                    }}
                >
                    <DataGridEx<T>
                        autoLoad={false}
                        height={gridHeight}
                        loadData={localLoadData}
                        mRef={refs}
                        columns={columns}
                        outerRef={(element?: HTMLDivElement) => {
                            if (element != null) setStates({ element });
                        }}
                        {...rest}
                    />
                </Box>
            );
        }

        // Delete
        delete rest.checkable;
        delete rest.borderRowsCount;
        delete rest.bottomHeight;
        delete rest.footerItemRenderer;
        delete rest.headerHeight;
        delete rest.hideFooter;
        delete rest.hoverColor;
        delete rest.selectable;

        return (
            <Box
                sx={{
                    height: gridHeight
                }}
            >
                <ScrollerListEx<T>
                    autoLoad={false}
                    height={gridHeight}
                    innerItemRenderer={innerItemRenderer}
                    itemSize={itemSize}
                    loadData={localLoadData}
                    mRef={refs}
                    oRef={(element) => {
                        if (element != null) setStates({ element });
                    }}
                    {...rest}
                />
            </Box>
        );
    }, [states.height, showDataGrid]);

    const { ref, data } = states;
    React.useEffect(() => {
        if (ref == null || data == null) return;
        ref.reset({ data });
    }, [ref, data]);

    // Pull container id
    const pullContainer = states.element
        ? showDataGrid
            ? '.DataGridEx-Body'
            : '.ScrollerListEx-Body'
        : undefined;

    // Layout
    return (
        <CommonPage
            {...pageRest}
            paddings={{}}
            scrollContainer={states.element}
            pullContainer={pullContainer}
        >
            <Stack>
                <Box ref={dimensions[0][0]} sx={{ padding: paddings }}>
                    <SearchBar fields={fields} onSubmit={onSubmit} />
                </Box>
                {list}
            </Stack>
        </CommonPage>
    );
}
