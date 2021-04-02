import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { NotificationMessageType, NotifierMU } from '../../src';

// Root
const root: HTMLElement = document.createElement('div');
document.body.append(root);

// The state provider
var Provider = NotifierMU.setup({});
ReactDOM.render(<Provider />, root);

// Notifier
const notifier = NotifierMU.instance;

// Timer mock
// https://jestjs.io/docs/en/timer-mocks
jest.useFakeTimers();

test('Message tests', () => {
    act(() => {
        // Add the notification
        notifier.message(NotificationMessageType.Danger, 'Error Message');
    });

    expect(root.innerHTML).toContain('Error Message');

    act(() => {
        // Fast forward
        jest.runOnlyPendingTimers();
    });

    expect(root.innerHTML).not.toContain('Error Message');
});
