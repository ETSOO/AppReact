import { NotificationReturn } from '@etsoo/notificationbase';
import { NotificationReactCallProps } from '../notifier/Notifier';

/**
 * Input dialog props
 */
export type InputDialogProps = NotificationReactCallProps & {
    /**
     * Title
     */
    title: string;

    /**
     * Message
     */
    message: string;

    /**
     * Callback
     */
    callback: NotificationReturn<HTMLFormElement | undefined>;
};
