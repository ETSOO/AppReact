import React from 'react';
import {
    INotificaseBase,
    INotification,
    INotifier,
    Notification,
    NotificationAlign,
    NotificationCallProps,
    NotificationContainer,
    NotificationDictionary,
    NotificationRenderProps
} from '@etsoo/notificationbase';
import { IAction } from '@etsoo/appscript';
import { State } from '../states/State';
import { IProviderProps, IUpdate } from '../states/IState';

/**
 * React notification call props
 */
export interface NotificationReactCallProps extends NotificationCallProps {
    /**
     * Full width
     */
    fullWidth?: boolean;

    /**
     * Full screen
     */
    fullScreen?: boolean;

    /**
     * Inputs layout
     */
    inputs?: React.ReactNode;

    /**
     * Max width
     */
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;

    /**
     * OK label
     */
    okLabel?: string;

    /**
     * false to hide cancel button
     */
    cancelButton?: boolean;

    /**
     * Cancel label
     */
    cancelLabel?: string;

    /**
     * Type
     */
    type?: string;

    /**
     * Primary button props
     */
    primaryButton?: {};

    /**
     * Buttons to override default buttons
     */
    buttons?: (
        notification: INotificationReact,
        callback: (
            event: React.MouseEvent<HTMLButtonElement>,
            value?: any
        ) => Promise<void>
    ) => React.ReactNode;
}

/**
 * React notification interface
 */
export interface INotificationReact
    extends INotification<React.ReactNode, NotificationReactCallProps> {}

/**
 * React notification base interface
 */
export interface INotificationBaseReact
    extends INotificaseBase<React.ReactNode, NotificationReactCallProps> {}

interface ReactNotifications
    extends NotificationDictionary<
        React.ReactNode,
        NotificationReactCallProps
    > {}

/**
 * Action to manage the notifier
 */
interface INotifierAction extends IAction {
    /**
     * Notification
     */
    notification: INotificationReact;

    /**
     * Add or dismiss
     */
    dismiss: boolean;
}

/**
 * React notification
 */
export abstract class NotificationReact extends Notification<
    React.ReactNode,
    NotificationReactCallProps
> {}

/**
 * React notification render props
 */
export interface NotificationReactRenderProps
    extends NotificationRenderProps,
        IProviderProps<INotifierAction> {}

/**
 * Notifier interface
 */
export interface INotifierReact
    extends INotifier<React.ReactNode, NotificationReactCallProps> {
    /**
     * Create state provider
     * @param className Style class name
     * @param optionGenerator Options generator
     * @returns Provider
     */
    createProvider(
        className?: string,
        optionGenerator?: INotifierOptions
    ): React.FunctionComponent<NotificationReactRenderProps>;
}

/**
 * Notifier options generator
 */
export interface INotifierOptions {
    (): any;
}

/**
 * Notifier for React
 */
export abstract class NotifierReact
    extends NotificationContainer<React.ReactNode, NotificationReactCallProps>
    implements INotifierReact
{
    // Instance
    private static _instance: INotifierReact;

    /**
     * Singleton instance
     */
    static get instance() {
        return NotifierReact._instance;
    }

    /**
     * Update notifier
     * @param notifier Notifier
     */
    protected static updateInstance(notifier: INotifierReact) {
        NotifierReact._instance = notifier;
    }

    /**
     * Constructor
     */
    protected constructor() {
        super((notification, dismiss) => {
            // Make sure the state update is set
            if (this.stateUpdate) this.stateUpdate({ notification, dismiss });
        });
    }

    /**
     * State update
     */
    protected stateUpdate?: React.Dispatch<INotifierAction>;

    /**
     * Create align container
     * @param align Align
     * @param children Children
     * @param options Other options
     */
    protected abstract createContainer(
        align: NotificationAlign,
        children: React.ReactNode[]
    ): React.ReactElement;

    /**
     * Create state provider
     * @param className Style class name
     * @returns Provider
     */
    createProvider(className?: string) {
        // Custom creator
        const creator = (
            state: ReactNotifications,
            update: React.Dispatch<INotifierAction>,
            props: NotificationReactRenderProps
        ) => {
            // Hold the current state update
            this.stateUpdate = update;

            // Aligns collection
            const aligns: React.ReactNode[] = [];
            for (const align in state) {
                // Notifications under the align
                const notifications = state[align];

                // UI collections
                const ui = notifications.map((notification) =>
                    notification.render(props, className + '-item')
                );

                // Add to the collection
                aligns.push(this.createContainer(Number(align), ui));
            }

            // Generate the component
            return React.createElement('div', { className }, aligns);
        };

        // Create state
        const { provider } = State.create(
            (
                state: NotificationDictionary<
                    React.ReactNode,
                    NotificationReactCallProps
                >,
                _action: INotifierAction
            ) => {
                // Collection update is done with NotificationContainer
                return { ...state };
            },
            this.notifications,
            {} as IUpdate<
                NotificationDictionary<
                    React.ReactNode,
                    NotificationReactCallProps
                >,
                INotifierAction
            >,
            creator
        );

        return provider;
    }
}
