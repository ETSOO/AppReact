import React from 'react';
import {
    INotification,
    INotifier,
    Notification
} from '@etsoo/notificationbase';

/**
 * React notification interface
 */
export interface INotificationReact extends INotification<React.ReactNode> {}

/**
 * React notification
 */
export abstract class NotificationReact extends Notification<React.ReactNode> {}

/**
 * Notifier interface
 */
export interface INotifierReact extends INotifier<React.ReactNode> {}
