import {
    NotificationContent,
    NotificationReturn
} from '@etsoo/notificationbase';
import { NotificationReactCallProps } from '../notifier/Notifier';

/**
 * Input dialog props
 */
export type InputDialogProps = NotificationReactCallProps & {
    /**
     * Title
     */
    title: NotificationContent<React.ReactNode>;

    /**
     * Message
     */
    message: NotificationContent<React.ReactNode>;

    /**
     * Callback
     */
    callback: NotificationReturn<HTMLFormElement | undefined>;
};
