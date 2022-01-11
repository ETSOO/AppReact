import { DataTypes } from '@etsoo/shared';
import { Box, Stack, SxProps, Theme } from '@mui/material';
import React from 'react';
import { ListChildComponentProps } from 'react-window';
import { Labels } from '../app/Labels';
import { GridColumn } from '../components/GridColumn';
import {
    GridDataGet,
    GridJsonData,
    GridLoadDataProps
} from '../components/GridLoader';
import useCombinedRefs from '../uses/useCombinedRefs';
import { useDimensions } from '../uses/useDimensions';
import {
    DataGridEx,
    DataGridExCalColumns,
    DataGridExProps
} from './DataGridEx';
import { GridMethodRef } from './GridMethodRef';
import { PullToRefreshUI } from './PullToRefreshUI';
import {
    ScrollerListEx,
    ScrollerListExInnerItemRendererProps
} from './ScrollerListEx';
import { SearchBar } from './SearchBar';

/**
 * ResponsibleContainer props
 */
export interface ResponsibleContainerProps<
    T extends {},
    F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate
> extends Omit<
        DataGridExProps<T>,
        | 'height'
        | 'itemKey'
        | 'loadData'
        | 'mRef'
        | 'onScroll'
        | 'onItemsRendered'
    > {
    /**
     * Height will be deducted
     * @param height Current calcuated height
     */
    adjustHeight?: (height: number) => number;

    /**
     * Columns
     */
    columns: GridColumn<T>[];

    /**
     * Min width to show Datagrid
     */
    dataGridMinWidth?: number;

    /**
     * Search fields
     */
    fields?: React.ReactElement[];

    /**
     * Search field template
     */
    fieldTemplate?: F;

    /**
     * Grid height
     */
    height?: number;

    /**
     * Inner item renderer
     */
    innerItemRenderer: (
        props: ScrollerListExInnerItemRendererProps<T>
    ) => React.ReactNode;

    /**
     * Item renderer
     */
    itemRenderer?: (props: ListChildComponentProps<T>) => React.ReactElement;

    /**
     * Item size, a function indicates its a variable size list
     */
    itemSize: ((index: number) => number) | number;

    /**
     * Listbox SX (dataGrid determines the case)
     */
    listBoxSx?: (dataGrid: boolean) => SxProps<Theme>;

    /**
     * Load data callback
     */
    loadData: (
        data: GridJsonData & DataTypes.BasicTemplateType<F>
    ) => PromiseLike<T[] | null | undefined>;

    /**
     * Methods
     */
    mRef?: React.MutableRefObject<GridMethodRef | undefined>;

    /**
     * Pull to refresh data
     */
    pullToRefresh?: boolean;

    /**
     * Searchbox SX
     */
    searchBoxSx?: SxProps<Theme>;

    /**
     * Size ready to read miliseconds span
     */
    sizeReadyMiliseconds?: number;
}

interface LocalRefs {
    rect?: DOMRect;
    ref?: GridMethodRef;
    mounted?: boolean;
}

/**
 * Responsible container
 * @param props Props
 * @returns Layout
 */
export function ResponsibleContainer<
    T extends {},
    F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate
>(props: ResponsibleContainerProps<T, F>) {
    // Destruct
    const {
        adjustHeight,
        columns,
        dataGridMinWidth = DataGridExCalColumns(columns).total,
        fields,
        fieldTemplate,
        height,
        listBoxSx,
        loadData,
        mRef,
        pullToRefresh = true,
        searchBoxSx,
        sizeReadyMiliseconds = 0,
        ...rest
    } = props;

    // Labels
    const labels = Labels.CommonPage;

    // Refs
    const refs = React.useRef<LocalRefs>({});

    const mRefs = useCombinedRefs(mRef, (ref: GridMethodRef) => {
        if (ref == null) return;
        refs.current.ref = ref;
    });

    // Update mounted state
    React.useEffect(() => {
        return () => {
            refs.current.mounted = false;
        };
    }, []);

    // Has fields
    const hasFields = fields != null && fields.length > 0;

    // Load data
    const localLoadData = (props: GridLoadDataProps) => {
        refs.current.mounted = true;
        const data = GridDataGet(props, fieldTemplate);
        return loadData(data);
    };

    // On submit callback
    const onSubmit = (data: FormData, _reset: boolean) => {
        if (data == null || rect == null || refs.current.ref == null) return;
        refs.current.ref.reset({ data });
    };

    // Watch container
    const { dimensions } = useDimensions(
        1,
        undefined,
        sizeReadyMiliseconds,
        (_preRect, rect) => {
            // Check
            if (rect == null) return true;

            // Last rect
            const lastRect = refs.current.rect;

            // 32 = scroll bar width
            if (
                lastRect != null &&
                refs.current.mounted !== true &&
                Math.abs(rect.width - lastRect.width) <= 32 &&
                Math.abs(rect.height - lastRect.height) <= 32
            )
                return true;

            // Hold the new rect
            refs.current.rect = rect;

            return false;
        }
    );

    // Rect
    const rect = dimensions[0][2];

    // Create list
    const [list, showDataGrid] = (() => {
        // No layout
        if (rect == null) return [null, false];

        // Width
        const width = rect.width;

        // Show DataGrid or List dependng on width
        const showDataGrid = width >= dataGridMinWidth;

        // Height
        let heightLocal: number;
        if (height != null) {
            heightLocal = height;
        } else {
            // Auto calculation
            heightLocal =
                window.innerHeight - Math.round(rect.top + rect.height + 1);

            const style = window.getComputedStyle(dimensions[0][1]!);
            const boxPadding = parseFloat(style.paddingLeft);
            if (!isNaN(boxPadding)) heightLocal -= 2 * boxPadding;

            if (adjustHeight != null) {
                heightLocal -= adjustHeight(heightLocal);
            }
        }

        if (showDataGrid) {
            // Delete
            delete rest.itemRenderer;

            return [
                <Box sx={listBoxSx == null ? undefined : listBoxSx(true)}>
                    <DataGridEx<T>
                        autoLoad={!hasFields}
                        height={heightLocal}
                        width={rect.width}
                        loadData={localLoadData}
                        mRef={mRefs}
                        columns={columns}
                        {...rest}
                    />
                </Box>,
                true
            ];
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

        return [
            <Box sx={listBoxSx == null ? undefined : listBoxSx(false)}>
                <ScrollerListEx<T>
                    autoLoad={!hasFields}
                    width={rect.width}
                    height={heightLocal}
                    loadData={localLoadData}
                    mRef={mRefs}
                    {...rest}
                />
            </Box>,
            false
        ];
    })();

    // Pull container
    const pullContainer = list
        ? showDataGrid
            ? '.DataGridEx-Body'
            : '.ScrollerListEx-Body'
        : undefined;

    // Layout
    return (
        <React.Fragment>
            <Stack>
                <Box ref={dimensions[0][0]} sx={searchBoxSx}>
                    {hasFields && (
                        <SearchBar fields={fields} onSubmit={onSubmit} />
                    )}
                </Box>
                {list}
            </Stack>
            {pullToRefresh && pullContainer && (
                <PullToRefreshUI
                    mainElement={pullContainer}
                    triggerElement={pullContainer}
                    instructionsPullToRefresh={labels.pullToRefresh}
                    instructionsReleaseToRefresh={labels.releaseToRefresh}
                    instructionsRefreshing={labels.refreshing}
                    onRefresh={() => refs.current.ref?.reset()}
                    shouldPullToRefresh={() => {
                        const container = document.querySelector(pullContainer);
                        return !container?.scrollTop;
                    }}
                />
            )}
        </React.Fragment>
    );
}
