import React from 'react';
import {
    Align,
    FixedSizeList,
    ListChildComponentProps,
    ListOnItemsRenderedProps,
    ListProps,
    VariableSizeList
} from 'react-window';

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
     * Batch size when load data, default is 10
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
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    items: T[];
}

/**
 * Scroller list forward ref
 */
export interface ScrollerListForwardRef extends ScrollerListRef {
    /**
     * Refresh data
     */
    refresh(): void;

    /**
     * Reset all data
     * @param reload Reload data, default is true
     */
    reset(reload?: boolean): void;
}

/**
 * Scroller vertical list
 * @param props Props
 * @returns Component
 */
export const ScrollerList = <T extends any>(
    props: ScrollerListProps<T> & { mRef?: React.Ref<ScrollerListForwardRef> }
) => {
    // Destruct
    const {
        height = window.innerHeight,
        width = '100%',
        mRef,
        style = {},
        itemRenderer,
        itemSize,
        loadBatchSize = 10,
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
            if (result == null) {
                state.isNextPageLoading = false;
                return;
            }

            stateUpdate({
                items: state.items.concat(result),
                currentPage: state.currentPage + pageAdd,
                hasNextPage: result.length >= loadBatchSize,
                isNextPageLoading: false
            });
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

    React.useImperativeHandle(mRef, () => {
        const refMethods = listRef.current as ScrollerListRef;

        return {
            /**
             * Refresh data
             */
            refresh(): void {
                loadDataLocal(0);
            },

            reset(reload: boolean = true): void {
                // Reset state
                stateUpdate({
                    items: [],
                    currentPage: 0,
                    hasNextPage: true,
                    isNextPageLoading: false
                });

                // Reload data
                if (reload) loadDataLocal();
            },

            scrollTo(scrollOffset: number): void {
                refMethods.scrollTo(scrollOffset);
            },

            scrollToItem(index: number, align?: Align): void {
                refMethods.scrollToItem(index, align);
            }
        };
    });

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

        // First load
        loadDataLocal();

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
        if (props.visibleStopIndex + threshold > state.items.length) {
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

    // Layout
    return typeof itemSize === 'function' ? (
        <VariableSizeList<T>
            height={height}
            width={width}
            itemCount={itemCount}
            itemSize={itemSize}
            outerRef={outerRef}
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
            outerRef={outerRef}
            ref={listRef}
            style={style}
            onItemsRendered={onItemsRenderedLocal}
            {...rest}
        >
            {itemRendererLocal}
        </FixedSizeList>
    );
};
