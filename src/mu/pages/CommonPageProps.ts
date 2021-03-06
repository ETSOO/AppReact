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
     * On refresh callback, only when authorized = true
     */
    onRefresh?: () => void | PromiseLike<void>;

    /**
     * On page update, when authorized = null or true case, may uses onRefresh
     */
    onUpdate?: () => void | PromiseLike<void>;

    /**
     * On page update, all cases with authorized
     */
    onUpdateAll?: IStateUpdate;

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
