import React from 'react';
import { Container, Fab } from '@material-ui/core';
import { FabBox } from '../FabBox';
import { ScrollTopFab } from '../ScrollTopFab';
import { PullToRefreshUI } from '../PullToRefreshUI';
import RefreshIcon from '@material-ui/icons/Refresh';
import { Labels } from '../../app/Labels';
import { MUGlobal } from '../MUGlobal';
import { CommonPageProps } from './CommonPageProps';
import { MoreFab } from '../MoreFab';
import { ReactAppStateDetector } from '../../app/ReactApp';

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
        onUpdate,
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

    // Update
    const update = onUpdate
        ? onUpdate
        : onRefresh
        ? (authorized?: boolean) => {
              if (authorized) onRefresh();
          }
        : undefined;

    // Return the UI
    return (
        <React.Fragment>
            {update && <ReactAppStateDetector update={update} />}
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
                    shouldPullToRefresh={() => {
                        const container = document.querySelector(pullContainer);
                        return !container?.scrollTop;
                    }}
                />
            )}
        </React.Fragment>
    );
}
