import { Box, Stack } from '@mui/material';
import React from 'react';
import { GridDataGet, GridLoadDataProps } from '../../components/GridLoader';
import { ScrollerListForwardRef } from '../../components/ScrollerList';
import useCombinedRefs from '../../uses/useCombinedRefs';
import { useDimensions } from '../../uses/useDimensions';
import { MUGlobal } from '../MUGlobal';
import { ScrollerListEx } from '../ScrollerListEx';
import { SearchBar } from '../SearchBar';
import { CommonPage } from './CommonPage';
import { ListPageProps } from './ListPageProps';

/**
 * Fixed height list page
 * @param props Props
 * @returns Component
 */
export function FixedListPage<T, F extends {}>(
    props: ListPageProps<T, F> & {
        /**
         * Height will be deducted
         * @param height Current calcuated height
         */
        adjustHeight?: (height: number) => number;
    }
) {
    // Destruct
    const {
        adjustHeight,
        fields,
        fieldTemplate,
        loadData,
        mRef,
        sizeReadyMiliseconds = 100,
        pageProps = {},
        ...rest
    } = props;

    pageProps.paddings ??= MUGlobal.pagePaddings;

    // States
    const [states] = React.useState<{
        data?: FormData;
        ref?: ScrollerListForwardRef;
    }>({});

    // Scroll container
    const [scrollContainer, updateScrollContainer] = React.useState<
        HTMLElement | undefined
    >();

    const refs = useCombinedRefs(mRef, (ref: ScrollerListForwardRef) => {
        if (ref == null) return;

        const first = states.ref == null;

        states.ref = ref;

        if (first) reset();
    });

    const reset = () => {
        if (states.data == null || states.ref == null) return;
        states.ref.reset({ data: states.data });
    };

    // On submit callback
    const onSubmit = (data: FormData, _reset: boolean) => {
        states.data = data;
        reset();
    };

    const localLoadData = (props: GridLoadDataProps) => {
        const data = GridDataGet(props, fieldTemplate);
        return loadData(data);
    };

    // Watch container
    const { dimensions } = useDimensions(1, undefined, sizeReadyMiliseconds);
    const rect = dimensions[0][2];
    const list = React.useMemo(() => {
        if (rect != null && rect.height > 50) {
            let height =
                window.innerHeight - Math.round(rect.top + rect.height + 1);

            if (adjustHeight != null) {
                height -= adjustHeight(height);
            }

            return (
                <Box
                    id="list-container"
                    sx={{
                        height: height + 'px'
                    }}
                >
                    <ScrollerListEx<T>
                        autoLoad={false}
                        height={height}
                        loadData={localLoadData}
                        mRef={refs}
                        oRef={(element) => {
                            if (element != null) updateScrollContainer(element);
                        }}
                        {...rest}
                    />
                </Box>
            );
        }
    }, [rect]);

    // Pull container id
    const pullContainer = scrollContainer?.parentElement
        ? '#' + scrollContainer?.parentElement.id
        : undefined;

    const { paddings, ...pageRest } = pageProps;

    // Layout
    return (
        <CommonPage
            {...pageRest}
            paddings={{}}
            scrollContainer={scrollContainer}
            pullContainer={pullContainer}
        >
            <Stack>
                <Box ref={dimensions[0][0]} sx={{ padding: paddings }}>
                    <SearchBar fields={fields} onSubmit={onSubmit} />
                </Box>
                {list}
            </Stack>
        </CommonPage>
    );
}
