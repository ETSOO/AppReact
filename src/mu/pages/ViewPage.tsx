import { Grid, GridProps, LinearProgress, Typography } from '@mui/material';
import React from 'react';
import { globalApp } from '../../app/ReactApp';
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
     * Label field
     */
    label: string | (() => React.ReactNode);

    /**
     * Display as single row
     */
    singleRow?: boolean;
}

type ViewPageFieldType<T> = (string & keyof T) | ViewPageField<T>;

/**
 * View page props
 */
export interface ViewPageProps<T extends {}> extends CommonPageProps {
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

    if (typeof field === 'object') {
        // Destruct
        const {
            data: fieldData,
            label: fieldLabel,
            singleRow = false,
            ...rest
        } = field;

        gridProps = {
            ...rest,
            ...(singleRow && { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 })
        };

        // Field data
        if (typeof fieldData === 'function') itemData = fieldData(data);
        else itemData = formatItemData(formatItemData);

        // Field label
        itemLabel =
            typeof fieldLabel === 'function'
                ? fieldLabel()
                : globalApp.get<string>(fieldLabel) ?? fieldLabel;
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
                            '.MuiTypography-subtitle2': { fontWeight: 'bold' }
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
                    {children}
                </React.Fragment>
            )}
        </CommonPage>
    );
}
