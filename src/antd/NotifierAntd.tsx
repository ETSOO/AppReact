import {
    NotificationContainer,
    NotificationMessageType,
    NotificationParameters,
    NotificationReturn,
    NotificationType
} from '@etsoo/notificationbase';
import { DataTypes } from '@etsoo/shared';
import {
    Checkbox,
    DatePicker,
    Input,
    InputNumber,
    message,
    notification as notificationAntd,
    Slider,
    Space,
    Switch,
    TimePicker
} from 'antd';
import { ArgsProps, MessageType } from 'antd/lib/message';
import { ArgsProps as NArgsProps } from 'antd/lib/notification';
import modal, { ModalFuncProps } from 'antd/lib/modal';
import React from 'react';
import {
    INotificationReact,
    INotifierReact,
    NotificationReact
} from '../notifier/Notifier';

// Modal ref
interface IModalRef {
    destroy: () => void;
    update: (configUpdate: ModalFuncProps) => void;
}

// Is modal ref
function isModalRef(target: any): target is IModalRef {
    return 'destroy' in target;
}

/**
 * Antd notification
 */
export class NotificationAntd extends NotificationReact {
    /**
     * Render method
     * @param className Style class name
     */
    render(_className?: string) {
        return undefined;
    }
}

/**
 * Antd notifier
 */
export class NotifierAntd
    extends NotificationContainer<React.ReactNode>
    implements INotifierReact {
    // Container
    private container?: HTMLElement;

    // Labels
    private labels: DataTypes.ReadonlyStringDictionary;

    // Last loading
    private lastLoading?: MessageType;

    /**
     * Constructor
     * @param labels Labels
     * @param container Container
     */
    constructor(
        labels: DataTypes.ReadonlyStringDictionary,
        container: HTMLElement | undefined = undefined
    ) {
        // Update action
        super((notification, dismiss) => {
            // Type
            const { type, ref } = notification;

            // When dismiss
            if (dismiss) {
                if (ref != null) {
                    if (isModalRef(ref)) {
                        ref.destroy();
                    } else {
                        ref();
                    }
                }
                return;
            }

            // Type cases
            switch (type) {
                case NotificationType.Confirm:
                    this.createConfirm(notification);
                    break;
                case NotificationType.Error:
                    this.createAlert(notification);
                    break;
                case NotificationType.Prompt:
                    this.createPrompt(notification);
                    break;
                case NotificationType.Loading:
                    this.createLoading(notification);
                    break;
                default:
                    this.createMessage(notification);
                    break;
            }
        });

        // Container
        if (container) {
            notificationAntd.config({
                getContainer: () => container
            });
            message.config({
                getContainer: () => container
            });
        }
        this.container = container;

        // Labels
        this.labels = labels;
    }

    private createAlert(notification: INotificationReact) {
        // Destruct
        const {
            title = this.labels.warning ?? 'Warning',
            content,
            onReturn,
            renderSetup
        } = notification;

        // Direct parameters
        const props: ModalFuncProps = {
            title,
            content,
            getContainer: this.container,
            okText: this.createGetOKLabel(),
            onOk: onReturn
        };

        // Renderer setup
        if (renderSetup) renderSetup(props);

        // Show up
        notification.ref = modal.warning(props);
    }

    private createConfirm(notification: INotificationReact) {
        // Destruct
        const {
            title = this.labels.confirm ?? 'Confirm',
            content,
            onReturn,
            renderSetup
        } = notification;

        // Direct parameters
        const props: ModalFuncProps = {
            title,
            content,
            getContainer: this.container,
            okText: this.createGetOKLabel(),
            cancelText: this.labels.cancel ?? 'Cancel',
            onOk: () => {
                if (onReturn) onReturn(true);
            },
            onCancel: () => {
                if (onReturn) onReturn(false);
            }
        };

        // Renderer setup
        if (renderSetup) renderSetup(props);

        // Show up
        notification.ref = modal.confirm(props);
    }

    private createLoading(notification: INotificationReact) {
        // Destruct
        const { content, timespan, id, renderSetup } = notification;

        // Direct parameters
        const config: Omit<ArgsProps, 'type'> = {
            content,
            duration: timespan,
            key: id
        };

        // Renderer setup
        if (renderSetup) renderSetup(config);

        // Show loading
        notification.ref = message.loading(config);

        // Reference
        this.lastLoading = notification.ref;
    }

    private createMessageType(type: NotificationType) {
        // Error
        if (type == NotificationMessageType.Danger) return 'error';

        // Success
        if (type == NotificationMessageType.Success) return 'success';

        // Warning
        if (type == NotificationMessageType.Warning) return 'warning';

        // Default
        return 'info';
    }

    private createMessage(notification: INotificationReact) {
        // Destruct
        const {
            type,
            content,
            timespan,
            id,
            title,
            renderSetup
        } = notification;
        if (title) {
            // Configuration
            const config: NArgsProps = {
                type: this.createMessageType(type),
                message: title,
                description: content,
                duration: timespan,
                key: id
            };

            // Renderer setup
            if (renderSetup) renderSetup(config);

            // Show up
            notificationAntd.open(config);
            notification.ref = () => {
                notificationAntd.close(id);
            };
        } else {
            // Configuration
            const config: ArgsProps = {
                type: this.createMessageType(type),
                content,
                duration: timespan,
                key: id
            };

            // Renderer setup
            if (renderSetup) renderSetup(config);

            // Show up
            notification.ref = message.open(config);
        }
    }

    private createPrompt(notification: INotificationReact) {
        // Props
        const {
            content,
            inputProps = {},
            onReturn,
            renderSetup,
            title = this.labels.input ?? 'Input'
        } = notification;

        // Input
        const inputRef = React.createRef<HTMLInputElement>();
        const { type, ...rest } = inputProps;
        let input: any;
        let inputValue: any;

        const change = (value: any) => (inputValue = value);
        const moment = (_time: any, stringValue: string) =>
            (inputValue = stringValue);

        if (type == 'switch') {
            inputValue = false;
            input = <Switch onChange={change} ref={inputRef} {...rest} />;
        } else if (type == 'slider') {
            input = <Slider onChange={change} ref={inputRef} {...rest} />;
        } else if (type == 'checkbox') {
            inputValue = false;
            const { label, ...cbRest } = rest;
            input = (
                <Checkbox ref={inputRef} {...cbRest}>
                    {label}
                </Checkbox>
            );
        } else if (type == 'checkboxGroup') {
            input = <Checkbox.Group onChange={change} {...rest} />;
        } else if (type == 'inputNumber') {
            input = <InputNumber onChange={change} ref={inputRef} {...rest} />;
        } else if (type == 'datePicker') {
            input = <DatePicker onChange={moment} ref={inputRef} {...rest} />;
        } else if (type == 'timePicker') {
            input = <TimePicker onChange={moment} ref={inputRef} {...rest} />;
        } else {
            input = (
                <Input onChange={change} ref={inputRef} type={type} {...rest} />
            );
        }

        // Content
        const contentContainer = (
            <Space direction="vertical">
                <div>{content}</div>
                {input}
            </Space>
        );

        // Direct parameters
        const props: ModalFuncProps = {
            title,
            content: contentContainer,
            getContainer: this.container,
            okText: this.createGetOKLabel(),
            onOk: () => {
                if (inputValue == null || inputValue === '') {
                    if (inputRef.current) inputRef.current.focus();

                    // empty value will prevent the modal close
                    return new Promise((_resolve, reject) => {
                        reject();
                    });
                }

                if (onReturn) onReturn(inputValue);
            }
        };

        // Renderer setup
        if (renderSetup) renderSetup(props);

        // Show up
        notification.ref = modal.info(props);
    }

    private createGetOKLabel() {
        return this.labels.ok ?? 'OK';
    }

    /**
     * Report error
     * @param error Error message
     * @param callback Callback
     * @param buttonLabel Confirm button label
     */
    alert(
        error: string,
        callback?: NotificationReturn<void>,
        buttonLabel?: string
    ): void {
        // Setup
        const n = new NotificationAntd(NotificationType.Error, error);

        // Callback
        n.onReturn = callback;

        // Render setup
        if (buttonLabel) {
            n.renderSetup = (options: ModalFuncProps) => {
                options.okText = buttonLabel;
            };
        }

        // Add to the collection
        this.add(n);
    }

    /**
     * Confirm action
     * @param message Message
     * @param title Title
     * @param callback Callback
     */
    confirm(
        message: string,
        title?: string,
        callback?: NotificationReturn<boolean>
    ): void {
        // Setup
        const n = new NotificationAntd(
            NotificationType.Confirm,
            message,
            title
        );

        // Callback
        n.onReturn = callback;

        // Add to the collection
        this.add(n);
    }

    /**
     * Hide loading
     */
    hideLoading(): void {
        if (this.lastLoading) {
            this.lastLoading();
            this.lastLoading = undefined;
        }
    }

    /**
     * Show a message
     * @param type Message type
     * @param message Message
     * @param title Title
     * @param parameters Parameters
     */
    message(
        type: NotificationMessageType,
        message: string,
        title?: string,
        parameters?: NotificationParameters
    ) {
        // Destruct
        const { align, timespan, callback } = parameters ?? {};

        // New item
        const n = new NotificationAntd(type, message, title, align);

        // Additional parameters
        n.onReturn = callback;
        if (timespan) n.timespan = timespan;

        // Add to the collection
        this.add(n);

        // Return it
        return n;
    }

    /**
     * Prompt action
     * @param message Message
     * @param callback Callback
     * @param title Title
     * @param props More properties
     */
    prompt(
        message: string,
        callback: NotificationReturn<string>,
        title?: string,
        props?: any
    ): void {
        // Setup
        const n = new NotificationAntd(NotificationType.Prompt, message, title);

        // Additional parameters
        n.inputProps = props;

        // Callback
        n.onReturn = callback;

        // Add to the collection
        this.add(n);
    }

    /**
     * Show loading
     * @param title Title
     */
    showLoading(title?: string): void {
        // Setup
        const n = new NotificationAntd(NotificationType.Loading, title ?? '');

        // Timespan to 0
        n.timespan = 0;

        // Add to the collection
        this.add(n);
    }
}
