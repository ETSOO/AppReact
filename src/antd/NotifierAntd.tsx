/** @jsx jsx */
import { css, jsx } from '@emotion/react';

import {
    INotificaseBase,
    NotificationAlign,
    NotificationMessageType,
    NotificationRenderProps,
    NotificationType,
    NotifierLabelKeys
} from '@etsoo/notificationbase';
import {
    Checkbox,
    DatePicker,
    Input,
    InputNumber,
    message,
    notification as notificationAntd,
    Slider,
    Space,
    Spin,
    SpinProps,
    Switch,
    TimePicker
} from 'antd';
import { ArgsProps } from 'antd/lib/message';
import { ArgsProps as NArgsProps } from 'antd/lib/notification';
import modal, { ModalFuncProps } from 'antd/lib/modal';
import React from 'react';
import {
    INotificationReact,
    NotificationReact,
    NotifierReact
} from '../notifier/Notifier';

// Modal ref
interface IModalRef {
    destroy: () => void;
    update: (configUpdate: ModalFuncProps) => void;
}

// Is modal ref
function isModalRef(target: any): target is IModalRef {
    return 'destroy' in target && 'update' in target;
}

/**
 * Antd notification
 */
export class NotificationAntd extends NotificationReact {
    private createLoading(props: NotificationRenderProps, className: string) {
        // Only for loading bar
        if (!this.open) {
            return <React.Fragment key={this.id}></React.Fragment>;
        }

        const setupProps: SpinProps = { size: 'large' };

        // Setup callback
        if (this.renderSetup) this.renderSetup(setupProps);

        // Content
        let content = this.content;
        if (content === '@')
            content = props.labels[NotifierLabelKeys.loading] ?? 'Loading...';

        return (
            <div className={className} key={this.id}>
                <div
                    css={css`
                        position: fixed;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        z-index: 1000;
                        background-color: rgba(0, 0, 0, 0.45);
                    `}
                ></div>
                <div
                    css={css`
                        position: fixed;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        z-index: 1000;
                    `}
                ></div>
                <Space
                    direction="vertical"
                    align="center"
                    css={css`
                        margin: 0 auto;
                    `}
                >
                    <Spin {...setupProps} />
                    {content && <div>{content}</div>}
                </Space>
            </div>
        );
    }

    private createAlert(props: NotificationRenderProps, className: string) {
        // Labels
        const labels = props.labels;
        const okText = labels[NotifierLabelKeys.alertOK] ?? 'OK';

        // Destruct
        const {
            title = labels[NotifierLabelKeys.alertTitle] ?? 'Warning',
            content,
            onReturn,
            renderSetup
        } = this;

        // Direct parameters
        const setupProps: ModalFuncProps = {
            title,
            content,
            className,
            okText,
            onOk: onReturn
        };

        // Renderer setup
        if (renderSetup) renderSetup(setupProps);

        // Show up
        this.ref = modal.warning(setupProps);
    }

    private createConfirm(props: NotificationRenderProps, className: string) {
        // Labels
        const labels = props.labels;

        const cancelText = labels[NotifierLabelKeys.confirmNo] ?? 'Cancel';
        const okText = labels[NotifierLabelKeys.confirmYes] ?? 'OK';

        // Destruct
        const {
            title = labels[NotifierLabelKeys.confirmTitle] ?? 'Confirm',
            content,
            onReturn,
            renderSetup
        } = this;

        // Direct parameters
        const setupProps: ModalFuncProps = {
            title,
            content,
            className,
            okText,
            cancelText,
            onOk: () => {
                if (onReturn) onReturn(true);
            },
            onCancel: () => {
                if (onReturn) onReturn(false);
            }
        };

        // Renderer setup
        if (renderSetup) renderSetup(setupProps);

        // Show up
        this.ref = modal.confirm(setupProps);
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

    private createMessage(_props: NotificationRenderProps, className: string) {
        // Destruct
        const { type, content, timespan, id, title, renderSetup } = this;

        // Onclose callback
        const onClose = () => this.dismiss();

        if (title) {
            // Configuration
            const config: NArgsProps = {
                type: this.createMessageType(type),
                message: title,
                description: content,
                duration: timespan,
                key: id,
                className,
                onClose
            };

            // Renderer setup
            if (renderSetup) renderSetup(config);

            // Show up
            notificationAntd.open(config);
            this.ref = () => {
                notificationAntd.close(id);
            };
        } else {
            // Configuration
            const config: ArgsProps = {
                type: this.createMessageType(type),
                content,
                duration: timespan,
                key: id,
                className,
                onClose
            };

            // Renderer setup
            if (renderSetup) renderSetup(config);

            // Show up
            this.ref = message.open(config);
        }
    }

    private createPrompt(props: NotificationRenderProps, className: string) {
        // Labels
        const labels = props.labels;
        const cancelText = labels[NotifierLabelKeys.promptCancel] ?? 'Cancel';
        const okText = labels[NotifierLabelKeys.promptOK] ?? 'OK';

        // Props
        const {
            content,
            inputProps = {},
            onReturn,
            renderSetup,
            title = labels[NotifierLabelKeys.promptTitle] ?? 'Input'
        } = this;

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
        const setupProps: ModalFuncProps = {
            title,
            content: contentContainer,
            className,
            cancelText,
            okText,
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
        if (renderSetup) renderSetup(setupProps);

        // Show up
        this.ref = modal.confirm(setupProps);
    }

    /**
     * Render method
     * @param props Props
     * @param className Style class name
     * @param classes Style classes
     */
    render(props: NotificationRenderProps, className: string, _classes: any) {
        // Destruct
        const { type, ref } = this;

        if (type == NotificationType.Loading) {
            return this.createLoading(props, className);
        }

        // Ref is not means created
        if (ref != null) {
            if (isModalRef(ref)) {
                ref.destroy();
            } else {
                ref();
            }
        }

        if (this.open) {
            // Type cases
            switch (type) {
                case NotificationType.Confirm:
                    this.createConfirm(props, className);
                    break;
                case NotificationType.Error:
                    this.createAlert(props, className);
                    break;
                case NotificationType.Prompt:
                    this.createPrompt(props, className);
                    break;
                default:
                    setTimeout(() => this.createMessage(props, className), 0);
                    break;
            }
        }

        return undefined;
    }
}

/**
 * Antd notifier
 */
export class NotifierAntd extends NotifierReact {
    /**
     * Create state and return provider
     * @param className Style class name
     * @returns Provider
     */
    static setup(className = 'notifier-antd') {
        // Create an instance
        NotifierReact.updateInstance(new NotifierAntd());

        return NotifierReact.instance.createProvider(className);
    }

    /**
     * Create align container
     * @param align Align
     * @param children Children
     * @param options Other options
     */
    protected createContainer = (
        align: NotificationAlign,
        children: React.ReactNode[],
        _options: any
    ) => {
        // Each align group, class equal to something similar to 'align-topleft'
        const alignText = NotificationAlign[align].toLowerCase();
        let className = `align-${alignText}`;

        return (
            <div key={`div-${alignText}`} className={className}>
                {children}
            </div>
        );
    };

    /**
     * Add raw definition
     * @param data Notification data definition
     */
    protected addRaw(data: INotificaseBase): INotificationReact {
        // Destruct
        const { type, content, title, align, ...rest } = data;

        // Setup
        const n = new NotificationAntd(type, content, title, align);

        // Assign other properties
        Object.assign(n, rest);

        // Add to the collection
        this.add(n);

        // Return
        return n;
    }
}
