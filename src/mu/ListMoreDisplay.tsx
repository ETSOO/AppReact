import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CardProps,
    CircularProgress
} from '@mui/material';
import React from 'react';
import { globalApp, LoadingButton } from '..';
import {
    GridLoadDataProps,
    GridLoader,
    GridLoaderStates
} from '../components/GridLoader';

/**
 * ListMoreDisplay props
 */
export interface ListMoreDisplayProps<T> extends CardProps, GridLoader<T> {
    /**
     * Children to display the list
     */
    children: (data: T, index: number) => React.ReactNode;

    /**
     * More button label
     */
    moreLabel?: string;

    /**
     * Header title
     */
    headerTitle?: React.ReactNode;
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
export function ListMoreDisplay<T extends {}>(props: ListMoreDisplayProps<T>) {
    // Destruct
    const {
        autoLoad = true,
        children,
        defaultOrderBy,
        headerTitle,
        loadBatchSize,
        loadData,
        moreLabel = typeof globalApp === 'undefined'
            ? undefined
            : globalApp.get('more') + '...',
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
    const loadDataLocal = async () => {
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

        const items = await loadData(loadProps);
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
        if (states.items == null) setStates({ items, completed: !hasNextPage });
        else
            setStates({
                items: [...states.items, ...items],
                completed: !hasNextPage
            });
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
                    <LoadingButton onClick={async () => await loadDataLocal()}>
                        {moreLabel}
                    </LoadingButton>
                </CardActions>
            )}
        </Card>
    );
}
