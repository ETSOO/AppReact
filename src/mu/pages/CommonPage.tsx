import React from 'react';
import { Container, ContainerProps, Fab } from '@material-ui/core';
import { FabBox } from '../FabBox';
import { ScrollTopFab } from '../ScrollTopFab';
import { PullToRefreshUI } from '../PullToRefreshUI';
import RefreshIcon from '@material-ui/icons/Refresh';
import { CustomFabSize } from '../CustomFabProps';
import { MoreAction, MoreFab } from '../MoreFab';
import { Labels } from '../../app/Labels';
import { MUGlobal } from '../MUGlobal';

/**
 * Common page props
 * Default container id is 'pageContainer'
 */
export interface CommonPageProps extends Omit<ContainerProps, 'id'> {
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
    onRefresh?: () => void | PromiseLike<void>;

    /**
     * Paddings
     */
    paddings?: {};

    /**
     * Pull container
     * @default '#page-container'
     */
    pullContainer?: string;

    /**
     * Scroll container
     */
    scrollContainer?: HTMLElement | object;
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
        paddings = MUGlobal.pagePaddings,
        scrollContainer,
        pullContainer,
        sx = {},
        ...rest
    } = props;

    // Merge style
    Object.assign(sx, {
        padding: paddings
    });

    // Labels
    const labels = Labels.CommonPage;

    // Return the UI
    return (
        <React.Fragment>
            <Container
                disableGutters={disableGutters}
                maxWidth={maxWidth}
                sx={sx}
                id="page-container"
                {...rest}
            >
                <FabBox sx={{ zIndex: 1 }}>
                    <ScrollTopFab
                        size={fabSize}
                        target={scrollContainer}
                        title={labels.scrollTop}
                    />
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
            {onRefresh != null && pullContainer != null && (
                <PullToRefreshUI
                    mainElement={pullContainer}
                    triggerElement={pullContainer}
                    instructionsPullToRefresh={labels.pullToRefresh}
                    instructionsReleaseToRefresh={labels.releaseToRefresh}
                    instructionsRefreshing={labels.refreshing}
                    onRefresh={onRefresh}
                />
            )}
        </React.Fragment>
    );
}
