import React from 'react';
import { Container, ContainerProps, Fab } from '@material-ui/core';
import { FabBox } from '../FabBox';
import { ScrollTopFab } from '../ScrollTopFab';
import { PullToRefreshUI } from '../PullToRefreshUI';
import RefreshIcon from '@material-ui/icons/Refresh';
import { DataTypes } from '@etsoo/shared';
import { CustomFabSize } from '../CustomFabProps';
import { MoreAction, MoreFab } from '../MoreFab';

/**
 * Common page props
 */
export interface CommonPageProps extends ContainerProps {
    /**
     * Fab buttons
     */
    fabButtons?: React.ReactNode;

    /**
     * Fab size
     */
    fabSize?: CustomFabSize;

    /**
     * Labels
     */
    labels?: DataTypes.ReadonlyStringDictionary;

    /**
     * More actions
     */
    moreActions?: MoreAction[];

    /**
     * On refresh callback
     */
    onRefresh?: (() => PromiseLike<void>) | (() => void);

    /**
     * Paddings in [xs, md]
     */
    paddings?: [number, number];
}

/**
 * Common page
 * @param props Props
 */
export function CommonPage(props: CommonPageProps) {
    // Destruct
    const {
        children,
        disableGutters = true,
        labels = {},
        fabButtons,
        fabSize = 'medium',
        maxWidth = false,
        moreActions,
        onRefresh,
        paddings = [2, 3],
        sx = {},
        ...rest
    } = props;

    // Merge style
    Object.assign(sx, {
        padding: { xs: paddings[0], sm: paddings[1] }
    });

    // Labels
    const labelScrollTop = labels.scrollTop ?? 'Scroll to top';
    const labelRefresh = labels.refresh ?? 'Refresh';
    const labelMore = labels.more ?? 'More';
    const labelPullToRefresh = labels.pullToRefresh ?? 'Pull down to refresh';
    const labelRefreshing = labels.refreshing ?? 'Refreshing';
    const labelReleaseToRefresh =
        labels.releaseToRefresh ?? 'Release to refresh';

    // Return the UI
    return (
        <Container
            disableGutters={disableGutters}
            maxWidth={maxWidth}
            sx={sx}
            {...rest}
        >
            {onRefresh != null && (
                <PullToRefreshUI
                    instructionsPullToRefresh={labelPullToRefresh}
                    instructionsReleaseToRefresh={labelReleaseToRefresh}
                    instructionsRefreshing={labelRefreshing}
                    onRefresh={onRefresh}
                />
            )}
            <FabBox>
                <ScrollTopFab size={fabSize} title={labelScrollTop} />
                {fabButtons}
                {onRefresh != null && (
                    <Fab
                        title={labelRefresh}
                        size={fabSize}
                        onClick={onRefresh}
                        sx={{ display: { xs: 'none', md: 'inherit' } }}
                    >
                        <RefreshIcon />
                    </Fab>
                )}
                <MoreFab
                    size={fabSize}
                    title={labelMore}
                    actions={moreActions}
                />
            </FabBox>
            {children}
        </Container>
    );
}
