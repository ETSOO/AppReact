import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { INotification, NotificationMessageType, NotifierMU } from '../../src';

// Root
const root = document.body;
const container: HTMLElement = document.createElement('div');
root.append(container);

// The state provider
var Provider = NotifierMU.setup();
ReactDOM.render(<Provider />, container);

// Notifier
const notifier = NotifierMU.instance;

// Timer mock
// https://jestjs.io/docs/en/timer-mocks
jest.useFakeTimers();

test('Alert tests', () => {
    // Click
    const handleClick = jest.fn();

    act(() => {
        // Add the notification
        notifier.alert('Alert message', handleClick);
    });

    // Button
    var button = root.getElementsByTagName('button');

    expect(button.length).toBe(1);
    expect(button[0].innerHTML).toContain('OK');
    button[0].click();
    expect(handleClick).toBeCalled();

    // Fast forward
    jest.runOnlyPendingTimers();
});

test('Confirm tests', () => {
    // Click
    const handleClick = jest.fn();

    act(() => {
        // Add the notification
        notifier.confirm('Confirm message', undefined, handleClick);
    });

    // Button
    var button = root.getElementsByTagName('button');

    expect(button.length).toBe(2);
    expect(button[0].innerHTML).toContain('Cancel');
    button[0].click();
    expect(handleClick).toBeCalled();

    // Fast forward
    jest.runOnlyPendingTimers();
});

test('Prompt tests', () => {
    // Click
    const handleClick = jest.fn();

    act(() => {
        // Add the notification
        notifier.prompt('Prompt message', handleClick, undefined, {
            type: 'switch'
        });
    });

    // Button
    var button = root.getElementsByTagName('button');

    expect(button.length).toBe(2); // Switch will generate a button
    expect(button[1].innerHTML).toContain('OK');
    button[1].click();
    expect(handleClick).toBeCalled();

    // Fast forward
    jest.runOnlyPendingTimers();
});

test('Message tests', () => {
    let n: INotification<React.ReactNode> | undefined;
    act(() => {
        // Add the notification
        n = notifier.message(NotificationMessageType.Danger, 'Error Message');
    });

    expect(n?.timespan).toBe(5);

    expect(root.innerHTML).toContain('Error Message');

    act(() => {
        // Here is the bug need further study...
        n?.dismiss();

        // Fast forward
        jest.runOnlyPendingTimers();
    });

    expect(root.innerHTML).not.toContain('Error Message');
});

test('Loading tests', () => {
    act(() => {
        // Add the notification
        notifier.showLoading('Loading');
    });

    expect(root.innerHTML).toContain('Loading');

    act(() => {
        notifier.hideLoading();

        // Fast forward
        jest.runOnlyPendingTimers();
    });

    expect(root.innerHTML).not.toContain('Loading');
});
