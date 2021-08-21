import { Box, Stack } from '@material-ui/core';
import React from 'react';
import { GridDataGet, GridLoadDataProps } from '../../components/GridLoader';
import { ScrollerGridForwardRef } from '../../components/ScrollerGrid';
import useCombinedRefs from '../../uses/useCombinedRefs';
import { useDimensions } from '../../uses/useDimensions';
import { DataGridEx } from '../DataGridEx';
import { MUGlobal } from '../MUGlobal';
import { SearchBar } from '../SearchBar';
import { CommonPage } from './CommonPage';
import { DataGridPageProps } from './DataGridPageProps';

interface LocalStates {
    data?: FormData;
    element?: HTMLElement;
    height?: number;
    ref?: ScrollerGridForwardRef;
}

/**
 * DataGrid page
 * @param props Props
 * @returns Component
 */
export function DataGridPage<T>(props: DataGridPageProps<T>) {
    // Destruct
    const {
        adjustHeight,
        fields,
        height,
        loadData,
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

    const refs = useCombinedRefs(mRef, (ref: ScrollerGridForwardRef) => {
        if (ref == null) return;
        states.ref = ref;
        //setStates({ ref });
    });

    // On submit callback
    const onSubmit = (data: FormData, _reset: boolean) => {
        setStates({ data });
    };

    const localLoadData = ({ data, ...rest }: GridLoadDataProps) => {
        const json = GridDataGet(data);
        return loadData({ ...json, ...rest });
    };

    // Watch container
    const { dimensions } = useDimensions(1, undefined, 50);
    const rect = dimensions[0][2];

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

    const list = React.useMemo(() => {
        const gridHeight = states.height;
        if (gridHeight == null) return;

        return (
            <DataGridEx<T>
                autoLoad={false}
                height={gridHeight}
                loadData={localLoadData}
                mRef={refs}
                outerRef={(element?: HTMLDivElement) => {
                    if (element != null) setStates({ element });
                }}
                {...rest}
            />
        );
    }, [states.height]);

    const { ref, data } = states;
    React.useEffect(() => {
        if (ref == null || data == null) return;
        ref.reset({ data });
    }, [ref, data]);

    // Pull container id
    const pullContainer = states.element?.parentElement
        ? '.DataGridEx-Body'
        : undefined;

    // Layout
    return (
        <CommonPage
            {...pageProps}
            scrollContainer={states.element}
            pullContainer={pullContainer}
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
