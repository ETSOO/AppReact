import { ContainerProps } from '@mui/material';
import { IStateUpdate } from '../../states/IState';
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
     * On page update, may uses onRefresh
     */
    onUpdate?: IStateUpdate;

    /**
     * Paddings
     */
    paddings?: {};

    /**
     * Pull container
     */
    pullContainer?: string;

    /**
     * Scroll container
     */
    scrollContainer?: HTMLElement | object;
}
