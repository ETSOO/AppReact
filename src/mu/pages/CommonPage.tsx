import React from 'react';
import { Container, ContainerProps, Fab } from '@material-ui/core';
import { FabBox } from '../FabBox';
import { ScrollTopFab } from '../ScrollTopFab';
import { PullToRefreshUI } from '../PullToRefreshUI';
import RefreshIcon from '@material-ui/icons/Refresh';
import { CustomFabSize } from '../CustomFabProps';
import { MoreAction, MoreFab } from '../MoreFab';
import { Labels } from '../../app/Labels';

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
    const labels = Labels.CommonPage;

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
                    instructionsPullToRefresh={labels.pullToRefresh}
                    instructionsReleaseToRefresh={labels.releaseToRefresh}
                    instructionsRefreshing={labels.refreshing}
                    onRefresh={onRefresh}
                />
            )}
            <FabBox>
                <ScrollTopFab size={fabSize} title={labels.scrollTop} />
                {fabButtons}
                {onRefresh != null && (
                    <Fab
                        title={labels.refresh}
                        size={fabSize}
                        onClick={onRefresh}
                        sx={{ display: { xs: 'none', md: 'inherit' } }}
                    >
                        <RefreshIcon />
                    </Fab>
                )}
                <MoreFab
                    size={fabSize}
                    title={labels.more}
                    actions={moreActions}
                />
            </FabBox>
            {children}
        </Container>
    );
}
