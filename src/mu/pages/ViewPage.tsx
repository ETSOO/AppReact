import { Grid, GridProps, LinearProgress, Typography } from '@mui/material';
import React from 'react';
import { globalApp } from '../../app/ReactApp';
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

function formatItemData(fieldData: unknown) {
    if (fieldData instanceof Date) return globalApp.formatDate(fieldData, 'd');
    return new String(fieldData);
}

function getItemField<T>(
    field: ViewPageFieldType<T>,
    data: T
): [React.ReactNode, React.ReactNode, GridProps] {
    // Item data and label
    let itemData: React.ReactNode,
        itemLabel: React.ReactNode,
        gridProps: GridProps;

    if (typeof field === 'object') {
        // Destruct
        const { data: fieldData, label: fieldLabel, ...rest } = field;
        gridProps = rest;

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
        gridProps = { xs: 12, sm: 6 };
    }

    return [itemData, itemLabel, gridProps];
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
        paddings,
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
                    <Grid container justifyContent="left" spacing={paddings}>
                        {fields.map((field) => {
                            // Get data
                            const [itemData, itemLabel, gridProps] =
                                getItemField(field, data);

                            // Layout
                            return (
                                <Grid item {...gridProps}>
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
