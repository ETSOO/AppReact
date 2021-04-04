import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { NotificationMessageType, NotifierAntd } from '../../src';

// Root
const root = document.body;
const container: HTMLElement = document.createElement('div');
document.body.append(container);

// The state provider
var Provider = NotifierAntd.setup();
ReactDOM.render(<Provider labels={{}} />, container);

// Notifier
const notifier = NotifierAntd.instance;

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

    // Fast forward
    jest.runOnlyPendingTimers();

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

    // Fast forward
    jest.runOnlyPendingTimers();

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

    // Fast forward
    jest.runOnlyPendingTimers();

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
    act(() => {
        // Add the notification
        notifier.message(
            NotificationMessageType.Danger,
            'Error Message',
            'Error'
        );

        // Fast forward
        // Renderer has a timer
        // Message will be closed automaticlly within a timer
        jest.advanceTimersToNextTimer(1);
    });

    expect(root.innerHTML).toContain('Error Message');

    act(() => {
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
