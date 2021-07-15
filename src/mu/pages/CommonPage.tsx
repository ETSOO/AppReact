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
        <React.Fragment>
            <Container
                disableGutters={disableGutters}
                maxWidth={maxWidth}
                sx={sx}
                id="pageContainer"
                {...rest}
            >
                <FabBox sx={{ zIndex: 1 }}>
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
            {onRefresh != null && (
                <PullToRefreshUI
                    mainElement="#pageContainer"
                    triggerElement="#pageContainer"
                    instructionsPullToRefresh={labels.pullToRefresh}
                    instructionsReleaseToRefresh={labels.releaseToRefresh}
                    instructionsRefreshing={labels.refreshing}
                    onRefresh={onRefresh}
                />
            )}
        </React.Fragment>
    );
}
