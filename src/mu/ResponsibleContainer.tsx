import { DataTypes } from '@etsoo/shared';
import { Box, Stack, SxProps, Theme } from '@mui/material';
import React from 'react';
import { ListChildComponentProps } from 'react-window';
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
import {
    ScrollerListEx,
    ScrollerListExInnerItemRendererProps
} from './ScrollerListEx';
import { SearchBar } from './SearchBar';

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
     * Searchbox SX
     */
    searchBoxSx?: SxProps<Theme>;

    /**
     * Size ready to read miliseconds span
     */
    sizeReadyMiliseconds?: number;
}

interface LocalRefs {
    height?: number;
    ref?: GridMethodRef;
}

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
        searchBoxSx,
        sizeReadyMiliseconds = 0,
        ...rest
    } = props;

    // Refs
    const refs = React.useRef<LocalRefs>({});

    const mRefs = useCombinedRefs(mRef, (ref: GridMethodRef) => {
        if (ref == null) return;
        refs.current.ref = ref;
    });

    // Has fields
    const hasFields = fields != null && fields.length > 0;

    // Watch container
    const { dimensions } = useDimensions(1, undefined, sizeReadyMiliseconds);
    const rect = dimensions[0][2];

    const localLoadData = (props: GridLoadDataProps) => {
        const data = GridDataGet(props, fieldTemplate);
        return loadData(data);
    };

    const list = React.useMemo(() => {
        // No rect
        if (rect == null) return;

        // If height is the same
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

        console.log(rect, heightLocal, refs.current.height);

        // Same height
        if (heightLocal === refs.current.height) return;
        refs.current.height = heightLocal;

        // Show DataGrid or List dependng on width
        const showDataGrid = rect.width >= dataGridMinWidth;

        if (showDataGrid) {
            // Delete
            delete rest.itemRenderer;

            return (
                <Box sx={listBoxSx == null ? undefined : listBoxSx(true)}>
                    <DataGridEx<T>
                        autoLoad={!hasFields}
                        height={heightLocal}
                        loadData={localLoadData}
                        mRef={mRefs}
                        columns={columns}
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
            <Box sx={listBoxSx == null ? undefined : listBoxSx(false)}>
                <ScrollerListEx<T>
                    autoLoad={!hasFields}
                    height={heightLocal}
                    loadData={localLoadData}
                    mRef={mRefs}
                    {...rest}
                />
            </Box>
        );
    }, [rect, height]);

    // On submit callback
    const onSubmit = (data: FormData, _reset: boolean) => {
        if (data == null || rect == null || refs.current.ref == null) return;
        refs.current.ref.reset({ data });
    };

    // Layout
    return (
        <Stack ref={hasFields ? undefined : dimensions[0][0]}>
            {hasFields && (
                <Box ref={dimensions[0][0]} sx={searchBoxSx}>
                    <SearchBar fields={fields} onSubmit={onSubmit} />
                </Box>
            )}
            {list}
        </Stack>
    );
}
