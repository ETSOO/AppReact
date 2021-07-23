import React from 'react';
import {
    Align,
    FixedSizeList,
    ListChildComponentProps,
    ListOnItemsRenderedProps,
    ListProps,
    VariableSizeList
} from 'react-window';
import useCombinedRefs from '../uses/useCombinedRefs';

/**
 * Scroller vertical list props
 */
export interface ScrollerListProps<T>
    extends Omit<
        ListProps<T>,
        'ref' | 'outerRef' | 'height' | 'width' | 'children' | 'itemCount'
    > {
    /**
     * Height of the list
     */
    height?: number;

    /**
     * Width of the list
     */
    width?: number | string;

    /**
     * Item renderer
     */
    itemRenderer: (itemProps: ListChildComponentProps<T>) => React.ReactElement;

    /**
     * Item size, a function indicates its a variable size list
     */
    itemSize: ((index: number) => number) | number;

    /**
     * Batch size when load data, default will be calcuated with height and itemSize
     */
    loadBatchSize?: number;

    /**
     * Load data
     */
    loadData: (
        page: number,
        loadBatchSize: number
    ) => PromiseLike<T[] | null | undefined>;

    /**
     * Threshold at which to pre-fetch data; default is half of loadBatchSize
     */
    threshold?: number | undefined;
}

interface ScrollerListRef {
    /**
     * Scroll to the specified offset (scrollTop or scrollLeft, depending on the direction prop).
     */
    scrollTo(scrollOffset: number): void;

    /**
     * Scroll to the specified item.
     */
    scrollToItem(index: number, align?: Align): void;
}

// Multiple states
interface States<T> {
    currentPage: number;
    lastLoadedItems?: number;
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    items: T[];
}

/**
 * Scroller list forward ref
 */
export interface ScrollerListForwardRef extends ScrollerListRef {
    /**
     * Refresh latest page data
     */
    refresh(): void;

    /**
     * Reset all data
     * @param reload Reload data, default is true
     */
    reset(): void;
}

/**
 * Scroller vertical list
 * @param props Props
 * @returns Component
 */
export const ScrollerList = <T extends any>(
    props: ScrollerListProps<T> & {
        mRef?: React.Ref<ScrollerListForwardRef>;
        oRef?: React.Ref<HTMLDivElement>;
    }
) => {
    // Calculate loadBatchSize
    const calculateBatchSize = (
        height: number,
        itemSize: ((index: number) => number) | number
    ) => {
        return (
            2 +
            Math.ceil(
                height /
                    (typeof itemSize === 'function' ? itemSize(0) : itemSize)
            )
        );
    };

    // Destruct
    const {
        height = window.innerHeight,
        width = '100%',
        mRef,
        oRef,
        style = {},
        itemRenderer,
        itemSize,
        loadBatchSize = calculateBatchSize(height, itemSize),
        loadData,
        threshold = Math.ceil(loadBatchSize / 2),
        onItemsRendered,
        ...rest
    } = props;

    // Style
    Object.assign(style, {
        width: '100%',
        height: '100%',
        display: 'inline-block'
    });

    // Refs
    const listRef = React.useRef<any>();
    const outerRef = React.useRef<HTMLDivElement>();

    const refs = useCombinedRefs(oRef, outerRef);

    // States
    const [state, stateUpdate] = React.useReducer(
        (state: States<T>, newState: Partial<States<T>>) => {
            return { ...state, ...newState };
        },
        {
            currentPage: 0,
            hasNextPage: true,
            isNextPageLoading: false,
            items: []
        }
    );

    // Load data
    const loadDataLocal = (pageAdd: number = 1) => {
        // Prevent multiple loadings
        if (!state.hasNextPage || state.isNextPageLoading) return;

        // Update state
        state.isNextPageLoading = true;

        loadData(state.currentPage, loadBatchSize).then((result) => {
            // Loading state
            state.isNextPageLoading = false;

            if (result == null) {
                return;
            }

            const newItems = result.length;

            if (pageAdd === 0) {
                // New items
                const items = state.lastLoadedItems
                    ? state.items
                          .splice(
                              state.items.length - state.lastLoadedItems,
                              state.lastLoadedItems
                          )
                          .concat(result)
                    : result;

                // Refresh current page
                stateUpdate({
                    items,
                    lastLoadedItems: newItems,
                    hasNextPage: newItems >= loadBatchSize
                });
            } else {
                stateUpdate({
                    items: state.items.concat(result),
                    lastLoadedItems: newItems,
                    currentPage: state.currentPage + pageAdd,
                    hasNextPage: newItems >= loadBatchSize
                });
            }
        });
    };

    const itemRendererLocal = (itemProps: ListChildComponentProps<T>) => {
        // Custom render
        return itemRenderer({
            ...itemProps,
            data: state.items[itemProps.index]
        });
    };

    // Update scroll location
    const updateScroll = (scrollY: number) => {
        const outerItem = outerRef.current;
        const refMethods = listRef.current as ScrollerListRef;
        if (outerItem == null || refMethods == null) return;

        const scrollTop = scrollY - outerItem.offsetTop;

        refMethods.scrollTo(scrollTop);
    };

    React.useImperativeHandle(
        mRef,
        () => {
            const refMethods = listRef.current as ScrollerListRef;

            return {
                /**
                 * Refresh data
                 */
                refresh(): void {
                    loadDataLocal(0);
                },

                reset(): void {
                    // Reset state, will load data soon
                    stateUpdate({
                        items: [],
                        lastLoadedItems: undefined,
                        currentPage: 0,
                        hasNextPage: true,
                        isNextPageLoading: false
                    });
                },

                scrollTo(scrollOffset: number): void {
                    refMethods.scrollTo(scrollOffset);
                },

                scrollToItem(index: number, align?: Align): void {
                    refMethods.scrollToItem(index, align);
                }
            };
        },
        []
    );

    // When layout ready
    React.useEffect(() => {
        let ticking = false;
        let lastKnownScrollPosition = 0;
        let requestAnimationFrameSeed = 0;

        // Window scroll handler
        const handleWindowScroll = () => {
            lastKnownScrollPosition = window.scrollY;

            if (!ticking) {
                requestAnimationFrameSeed = window.requestAnimationFrame(() => {
                    updateScroll(lastKnownScrollPosition);
                    ticking = false;
                    requestAnimationFrameSeed = 0;
                });
                ticking = true;
            }
        };

        // Add scroll event
        window.addEventListener('scroll', handleWindowScroll);

        // Return clear function
        return () => {
            // Cancel animation frame
            if (requestAnimationFrameSeed > 0)
                window.cancelAnimationFrame(requestAnimationFrameSeed);

            // Remove scroll event
            window.removeEventListener('scroll', handleWindowScroll);
        };
    }, []);

    // Local items renderer callback
    const onItemsRenderedLocal = (props: ListOnItemsRenderedProps) => {
        // No items, means no necessary to load more data during reset
        const itemCount = state.items.length;
        if (itemCount > 0 && props.visibleStopIndex + threshold > itemCount) {
            // Auto load next page
            loadDataLocal();
        }

        // Custom
        if (onItemsRendered) onItemsRendered(props);
    };

    // Item count
    const itemCount = state.hasNextPage
        ? state.items.length + 1
        : state.items.length;

    // Auto load data when current page is 0
    if (state.currentPage === 0) loadDataLocal();

    // Layout
    return typeof itemSize === 'function' ? (
        <VariableSizeList<T>
            height={height}
            width={width}
            itemCount={itemCount}
            itemSize={itemSize}
            outerRef={refs}
            ref={listRef}
            style={style}
            onItemsRendered={onItemsRenderedLocal}
            {...rest}
        >
            {itemRendererLocal}
        </VariableSizeList>
    ) : (
        <FixedSizeList<T>
            height={height}
            width={width}
            itemCount={itemCount}
            itemSize={itemSize}
            outerRef={refs}
            ref={listRef}
            style={style}
            onItemsRendered={onItemsRenderedLocal}
            {...rest}
        >
            {itemRendererLocal}
        </FixedSizeList>
    );
};
