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
     * Notification MU labels
     */
    export const NotificationMU = {
        alertTitle: 'Warning',
        alertOK: 'OK',
        confirmTitle: 'Confirm',
        confirmYes: 'OK',
        confirmNo: 'Cancel',
        promptTitle: 'Input',
        promptCancel: 'Cancel',
        promptOK: 'OK',
        loading: 'Loading'
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

    export interface setLabelsReference {
        commonPage?: DataTypes.ReadonlyStringDictionary;
        notificationMU?: DataTypes.ReadonlyStringDictionary;
        userAvatarEditor?: DataTypes.ReadonlyStringDictionary;
    }

    /**
     * Set components' labels
     * @param labels Labels
     * @param reference Key reference
     */
    export const setLabels = (
        labels: DataTypes.ReadonlySimpleObject,
        reference: setLabelsReference = {}
    ) => {
        Utils.setLabels(CommonPage, labels, reference.commonPage);
        Utils.setLabels(NotificationMU, labels, reference.notificationMU);
        Utils.setLabels(UserAvatarEditor, labels, reference.userAvatarEditor);
    };
}
