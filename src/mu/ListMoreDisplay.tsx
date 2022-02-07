import { DataTypes } from '@etsoo/shared';
import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CardProps,
    CircularProgress
} from '@mui/material';
import React from 'react';
import { globalApp } from '../app/ReactApp';
import {
    GridData,
    GridDataGet,
    GridLoadDataProps,
    GridLoader,
    GridLoaderStates
} from '../components/GridLoader';
import { LoadingButton } from './LoadingButton';

/**
 * ListMoreDisplay props
 */
export interface ListMoreDisplayProps<
    T,
    F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate
> extends CardProps,
        GridLoader<T> {
    /**
     * Children to display the list
     */
    children: (data: T, index: number) => React.ReactNode;

    /**
     * Search field template
     */
    fieldTemplate?: F;

    /**
     * Header renderer
     */
    headerRenderer?: (reset: (data?: GridData) => void) => React.ReactNode;

    /**
     * Header title
     */
    headerTitle?: React.ReactNode;

    /**
     * More button label
     */
    moreLabel?: string;
}

type states<T> = {
    items?: T[];
    completed: boolean;
};

/**
 * ListMoreDisplay
 * @param props Props
 * @returns Component
 */
export function ListMoreDisplay<
    T extends {},
    F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate
>(props: ListMoreDisplayProps<T, F>) {
    // Destruct
    const {
        autoLoad = true,
        children,
        defaultOrderBy,
        headerRenderer,
        headerTitle,
        loadBatchSize,
        loadData,
        moreLabel = typeof globalApp === 'undefined'
            ? undefined
            : globalApp.get('more') + '...',
        fieldTemplate,
        threshold,
        ...rest
    } = props;

    // Refs
    const refs = React.useRef<GridLoaderStates<T>>({
        autoLoad,
        currentPage: 0,
        hasNextPage: true,
        isNextPageLoading: false,
        orderBy: defaultOrderBy,
        batchSize: 10,
        loadedItems: 0,
        selectedItems: []
    });
    const ref = refs.current;

    // States
    const [states, setStates] = React.useReducer(
        (currentStates: states<T>, newStates: Partial<states<T>>) => {
            return { ...currentStates, ...newStates };
        },
        { completed: false }
    );

    // Load data
    const loadDataLocal = async (reset: boolean = false) => {
        // Prevent multiple loadings
        if (!ref.hasNextPage || ref.isNextPageLoading) return;

        // Update state
        ref.isNextPageLoading = true;

        // Parameters
        const { currentPage, batchSize, orderBy, orderByAsc, data } = ref;

        const loadProps: GridLoadDataProps = {
            currentPage,
            batchSize,
            orderBy,
            orderByAsc,
            data
        };

        const mergedData = GridDataGet(loadProps, fieldTemplate);

        const items = await loadData(mergedData);
        if (items == null || ref.isMounted === false) {
            return;
        }
        ref.isMounted = true;

        const newItems = items.length;
        const hasNextPage = newItems >= batchSize;
        ref.lastLoadedItems = newItems;
        ref.isNextPageLoading = false;
        ref.hasNextPage = hasNextPage;

        // Update rows
        if (states.items == null || reset)
            setStates({ items, completed: !hasNextPage });
        else
            setStates({
                items: [...states.items, ...items],
                completed: !hasNextPage
            });
    };

    const reset = (data?: GridData) => {
        // Update the form data
        ref.data = data;

        // Reset page number
        ref.isNextPageLoading = false;
        ref.currentPage = 0;
        ref.hasNextPage = true;

        // Load data
        loadDataLocal();
    };

    React.useEffect(() => {
        if (autoLoad) loadDataLocal();
    }, [autoLoad]);

    React.useEffect(() => {
        return () => {
            ref.isMounted = false;
        };
    }, []);

    // Loading
    if (states.items == null) return <CircularProgress size={20} />;

    return (
        <React.Fragment>
            {headerRenderer && headerRenderer(reset)}
            <Card {...rest}>
                <CardHeader title={headerTitle}></CardHeader>
                <CardContent
                    sx={{
                        paddingTop: 0,
                        paddingBottom: states.completed ? 0 : 'inherit'
                    }}
                >
                    {states.items.map((item, index) => children(item, index))}
                </CardContent>
                {!states.completed && (
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                        <LoadingButton
                            onClick={async () => await loadDataLocal()}
                        >
                            {moreLabel}
                        </LoadingButton>
                    </CardActions>
                )}
            </Card>
        </React.Fragment>
    );
}
