import React from 'react';
import { DataTypes } from '@etsoo/shared';
import {
    NotificationContainer,
    NotificationAlign
} from '@etsoo/notificationbase';

/**
 * Notification Display properties
 */
export interface NotificationDisplayProps {
    /**
     * Style class name
     */
    className?: string;

    /**
     * Create notification container
     * @param align Align
     * @param children Children
     */
    createContainer(
        align: NotificationAlign,
        children: React.ReactNode[]
    ): React.ReactNode;

    /**
     * UI labels
     */
    labels?: DataTypes.ReadonlyStringDictionary;

    /**
     * Each notification style class name
     */
    itemClassName?: string;
}

/**
 * Notification display
 */
export function NotificationDisplay(props: NotificationDisplayProps) {
    // Destruct
    const { className, createContainer, labels, itemClassName } = props;

    // User state to hold notification count
    const [count, updateCount] = React.useState(0);

    // Render notifications
    const renderNotifications = () => {
        // Aligns collection
        const aligns: React.ReactNode[] = [];

        // Aligns
        for (const align in NotificationContainer.notifications) {
            // Notifications under the align
            const notifications = NotificationContainer.notifications[align];

            // UI collections
            const ui = notifications.map((notification) =>
                notification.render(itemClassName, labels)
            );

            // Add to the collection
            aligns.push(createContainer(Number(align), ui));
        }

        // Return
        return aligns;
    };

    // Layout ready
    React.useEffect(() => {
        // Register current UI to the global container
        // Every update should register again under functional component
        let registerCalled = 0;
        NotificationContainer.register(() => {
            registerCalled++;
            updateCount(registerCalled);
        });

        return () => {
            // Dispose all notifications to avoid any timeout memory leak
            NotificationContainer.dispose();
        };
    }, []);

    React.useEffect(() => {
        // First time generation and no notification yet
        if (count === 0) return;

        // Remove from the collection with open = false, and dispose it
        NotificationContainer.clear();
    }, [count]);

    // Return composition
    return React.createElement(
        'div',
        { className, count },
        renderNotifications()
    );
}
