import React from 'react';
import { NotificationDisplay } from '../src/NotificationDisplay';
import { NotificationReact } from '../src/NotificationReact';
import {
    NotificationContainer,
    NotificationType,
    NotificationAlign
} from '@etsoo/notificationbase';
import { act } from 'react-dom/test-utils';
import { render, unmountComponentAtNode } from 'react-dom';

// Class implementation for tests
class NotificationReactTest extends NotificationReact {
    /**
     * Render method
     * @param className Style class name
     */
    render(className?: string) {
        return (
            <div key={this.id} className={className}>
                {this.open ? this.content : ''}
            </div>
        );
    }
}

// Timer mock
// https://jestjs.io/docs/en/timer-mocks
jest.useFakeTimers();

// Test notification display component
const displayUI = (
    <NotificationDisplay
        createContainer={(align, children) => {
            return (
                <div
                    key={align}
                    className={NotificationAlign[align].toLowerCase()}
                >
                    {children}
                </div>
            );
        }}
        className="test"
        itemClassName="item"
    />
);

let root: HTMLDivElement | null = null;
beforeEach(() => {
  // setup a DOM element as a render target
  root = document.createElement("div");
  document.body.appendChild(root);
});

afterEach(() => {
  // cleanup on exiting
  if(root != null) {
    unmountComponentAtNode(root);
    root.remove();
    root = null;
  }
});

test('Tests for NotificationUI with enzyme', () => {
    // Arrange

    // Render the UI in the document
    render(displayUI, root);
    const container = root?.querySelector('div.test');
    
    // Container
    expect(container).not.toBeNull();

    // Align groups
    // Object.keys(Enum) will return string and number keys
    expect(container?.childNodes.length).toBe(
        Object.keys(NotificationAlign).length / 2
    );

    // Notification object
    const notification = new NotificationReactTest(
        NotificationType.Loading,
        'Loading...'
    );

    act(() => {
        // Add the notification
        NotificationContainer.add(notification);

        // Fast forward
        jest.runOnlyPendingTimers();
    });

    // Unkown node
    const unkownDiv = container?.querySelector('div.unknown');

    // Node text
    expect(unkownDiv?.textContent).toBe('Loading...');

    act(() => {
        // Dismiss it
        notification.dismiss();

        // Fast forward
        jest.runOnlyPendingTimers();
    });

    expect(unkownDiv?.textContent).toBe('');
    expect(NotificationContainer.alignCount(NotificationAlign.Unknown)).toBe(0);
});

jest.clearAllTimers();
