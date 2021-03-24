# NotificationUI
**TypeScript abstract notification component of React, implemented from https://github.com/ETSOO/NotificationBase. Applied Material-UI version: https://github.com/ETSOO/NotificationMU**

## Installing

Using npm:

```bash
$ npm install @etsoo/notificationui
```

Using yarn:

```bash
$ yarn add @etsoo/notificationui
```

## NotificationDisplay
Notification display component of React version.
Properties:
```ts
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
     * Each notification style class name
     */
    itemClassName?: string;
}
```

## NotificationReact
Abstract implement of ReactNode UI.
```ts
abstract class NotificationReact extends Notification<React.ReactNode>
```