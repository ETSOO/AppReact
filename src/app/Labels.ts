import { DataTypes, Utils } from '@etsoo/shared';

/**
 * Labels
 */
export namespace Labels {
    /**
     * AutoComplete labels
     */
    export const AutoComplete = {
        clear: 'Clear',
        close: 'Close',
        loading: 'Loading…',
        noOptions: 'No options',
        moreTag: '{0} more',
        open: 'Open'
    };

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
        loading: 'Loading',
        success: 'Success',
        warning: 'Warning',
        info: 'Information'
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
     * setLabelReference key reference
     */
    export interface setLabelsReference {
        autoComplete?: DataTypes.ReadonlyStringDictionary;
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
        Utils.setLabels(AutoComplete, labels, reference.autoComplete);
        Utils.setLabels(CommonPage, labels, reference.commonPage);
        Utils.setLabels(NotificationMU, labels, reference.notificationMU);
        Utils.setLabels(UserAvatarEditor, labels, reference.userAvatarEditor);
    };
}
