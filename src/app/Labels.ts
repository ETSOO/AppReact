import { DataTypes, Utils } from '@etsoo/shared';

/**
 * Labels
 */
export namespace Labels {
    /**
     * Common page labels
     */
    export const CommonPage = {
        more: 'More',
        pullToRefresh: 'Pull down to refresh',
        refresh: 'Refresh',
        refreshing: 'Refreshing',
        releaseToRefresh: 'Release to refresh',
        scrollTop: 'Scroll to top'
    };

    /**
     * UserAvatarEditor labels
     */
    export const UserAvatarEditor = {
        done: 'Done',
        reset: 'Reset',
        rotateLeft: 'Rotate left 90°',
        rotateRight: 'Rotate right 90°',
        upload: 'Upload',
        zoom: 'Zoom'
    };

    /**
     * Set components' labels
     * @param labels Labels
     */
    export const setLabels = (labels: DataTypes.ReadonlySimpleObject) => {
        Utils.setLabels(CommonPage, labels);
        Utils.setLabels(UserAvatarEditor, labels);
    };
}
