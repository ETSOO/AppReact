import { ContainerProps } from '@material-ui/core';
import { CustomFabSize } from '../CustomFabProps';
import { MoreAction } from '../MoreFab';

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
