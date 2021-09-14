import { NotificationReturn } from '@etsoo/notificationbase';

/**
 * Input dialog props
 */
export type InputDialogProps = {
    /**
     * Title
     */
    title: string;

    /**
     * Message
     */
    message: string;

    /**
     * Inputs layout
     */
    inputs: React.ReactNode;

    /**
     * Callback
     */
    callback: NotificationReturn<HTMLFormElement>;

    /**
     * OK label
     */
    okLabel?: string;

    /**
     * Cancel label
     */
    cancelLabel?: string;
};
