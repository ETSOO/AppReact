import { Grid, GridProps, LinearProgress, Typography } from '@mui/material';
import React from 'react';
import { globalApp } from '../../app/ReactApp';
import {
    GridColumnRenderProps,
    GridDataType
} from '../../components/GridColumn';
import { HBox } from '../FlexBox';
import { GridDataFormat } from '../GridDataFormat';
import { MUGlobal } from '../MUGlobal';
import { CommonPage } from './CommonPage';
import { CommonPageProps } from './CommonPageProps';

/**
 * View page display field
 */
export interface ViewPageField<T extends {}> extends GridProps {
    /**
     * Data field
     */
    data: keyof T | ((item: T) => React.ReactNode);

    /**
     * Data type
     */
    dataType?: GridDataType;

    /**
     * Label field
     */
    label?: string | (() => React.ReactNode);

    /**
     * Display as single row
     */
    singleRow?: boolean;

    /**
     * Render props
     */
    renderProps?: GridColumnRenderProps;
}

type ViewPageFieldType<T> =
    | (string & keyof T)
    | [string & keyof T, GridDataType, GridColumnRenderProps?]
    | ViewPageField<T>;

/**
 * View page props
 */
export interface ViewPageProps<T extends {}> extends CommonPageProps {
    /**
     * Actions
     */
    actions?: React.ReactNode;

    /**
     * Fields to display
     */
    fields: ViewPageFieldType<T>[];

    /**
     * Load data
     */
    loadData: () => PromiseLike<T | undefined>;

    /**
     * Support refresh
     */
    supportRefresh?: boolean;
}

function formatItemData(fieldData: unknown): string | undefined {
    if (fieldData == null) return undefined;
    if (typeof fieldData === 'string') return fieldData;
    if (fieldData instanceof Date) return globalApp.formatDate(fieldData, 'd');
    return `${fieldData}`;
}

function getItemField<T>(
    field: ViewPageFieldType<T>,
    data: T
): [React.ReactNode, React.ReactNode, GridProps] {
    // Item data and label
    let itemData: React.ReactNode,
        itemLabel: React.ReactNode,
        gridProps: GridProps = {};

    if (Array.isArray(field)) {
        const [fieldData, fieldType, renderProps] = field;
        itemData = GridDataFormat(data[fieldData], fieldType, renderProps);
        itemLabel = globalApp.get<string>(fieldData) ?? fieldData;
    } else if (typeof field === 'object') {
        // Destruct
        const {
            data: fieldData,
            dataType,
            label: fieldLabel,
            renderProps,
            singleRow = false,
            ...rest
        } = field;

        gridProps = {
            ...rest,
            ...(singleRow && { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 })
        };

        // Field data
        if (typeof fieldData === 'function') itemData = fieldData(data);
        else if (dataType == null) itemData = formatItemData(data[fieldData]);
        else itemData = GridDataFormat(data[fieldData], dataType, renderProps);

        // Field label
        itemLabel =
            typeof fieldLabel === 'function'
                ? fieldLabel()
                : globalApp.get<string>(
                      fieldLabel ??
                          (typeof fieldData === 'string' ? fieldData : 'noData')
                  ) ?? fieldLabel;
    } else {
        itemData = formatItemData(data[field]);
        itemLabel = globalApp.get<string>(field) ?? field;
    }

    return [
        itemData,
        itemLabel,
        { xs: 12, sm: 6, md: 6, lg: 4, xl: 3, ...gridProps }
    ];
}

/**
 * View page
 * @param props Props
 */
export function ViewPage<T extends {}>(props: ViewPageProps<T>) {
    // Destruct
    const {
        actions,
        children,
        fields,
        loadData,
        paddings = MUGlobal.pagePaddings,
        supportRefresh = true,
        ...rest
    } = props;

    // Data
    const [data, setData] = React.useState<T>();

    // Load data
    const onRefresh = async () => {
        const result = await loadData();
        if (result == null) return;
        setData(result);
    };

    return (
        <CommonPage
            paddings={paddings}
            onRefresh={supportRefresh ? onRefresh : undefined}
            onUpdate={supportRefresh ? undefined : onRefresh}
            {...rest}
            scrollContainer={global}
        >
            {data == null ? (
                <LinearProgress />
            ) : (
                <React.Fragment>
                    <Grid
                        container
                        justifyContent="left"
                        spacing={paddings}
                        sx={{
                            '.MuiTypography-subtitle2': {
                                fontWeight: 'bold'
                            }
                        }}
                    >
                        {fields.map((field, index) => {
                            // Get data
                            const [itemData, itemLabel, gridProps] =
                                getItemField(field, data);

                            if (itemData == null) return undefined;

                            // Layout
                            return (
                                <Grid item {...gridProps} key={index}>
                                    <Typography
                                        variant="caption"
                                        component="div"
                                    >
                                        {itemLabel}:
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        {itemData}
                                    </Typography>
                                </Grid>
                            );
                        })}
                    </Grid>
                    {actions != null && (
                        <HBox paddingTop={paddings} paddingBottom={paddings}>
                            {actions}
                        </HBox>
                    )}
                    {children}
                </React.Fragment>
            )}
        </CommonPage>
    );
}
