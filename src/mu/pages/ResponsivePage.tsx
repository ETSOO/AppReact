import { DataTypes } from '@etsoo/shared';
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
export function ResponsivePage<
    T,
    F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate
>(props: ResponsePageProps<T, F>) {
    // Destruct
    const {
        adjustHeight,
        columns,
        dataGridMinWidth = DataGridExCalColumns(columns).total,
        fields,
        fieldTemplate,
        height,
        loadData,
        innerItemRenderer,
        itemSize,
        mRef,
        sizeReadyMiliseconds = 0,
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

    const localLoadData = (props: GridLoadDataProps) => {
        const data = GridDataGet(props, fieldTemplate);
        return loadData(data);
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
    const { dimensions } = useDimensions(1, undefined, sizeReadyMiliseconds);
    const rect = dimensions[0][2];
    const showDataGrid = (rect?.width ?? 0) >= dataGridMinWidth;

    React.useEffect(() => {
        if (rect != null && rect.height > 50 && height == null) {
            let gridHeight =
                window.innerHeight - Math.round(rect.top + rect.height + 1);

            const style = window.getComputedStyle(dimensions[0][1]!);
            const boxPadding = parseFloat(style.paddingLeft);
            if (!isNaN(boxPadding)) gridHeight -= 2 * boxPadding;

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

        // Show in a row when under DataGrid
        pageProps.fabColumnDirection = !showDataGrid;

        if (showDataGrid) {
            // Delete
            delete rest.itemRenderer;

            return (
                <Box
                    sx={{
                        padding: paddings
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

        // Half
        const halfPadding = MUGlobal.half(paddings);
        const style = window.getComputedStyle(dimensions[0][1]!);
        const boxPadding = parseFloat(style.paddingLeft);

        return (
            <Box
                sx={{
                    height: gridHeight + (isNaN(boxPadding) ? 0 : boxPadding),
                    paddingTop: halfPadding,
                    paddingBottom: halfPadding
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
    }, [states.height, showDataGrid, localLoadData]);

    const sizeRef = React.useRef<[number, number]>();

    const { ref, data } = states;
    React.useEffect(() => {
        if (ref == null || data == null || rect == null) return;

        // Resize without reset
        if (sizeRef.current == null) {
            sizeRef.current = [rect.width, rect.height];
        } else if (
            sizeRef.current[0] !== rect.width ||
            sizeRef.current[1] !== rect.height
        ) {
            sizeRef.current = [rect.width, rect.height];
            return;
        }

        ref.reset({ data });
    });

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
                <Box
                    ref={dimensions[0][0]}
                    sx={{
                        paddingLeft: paddings,
                        paddingTop: MUGlobal.increase(paddings, 0.5, 'xs'),
                        paddingRight: paddings
                    }}
                >
                    <SearchBar fields={fields} onSubmit={onSubmit} />
                </Box>
                {list}
            </Stack>
        </CommonPage>
    );
}
