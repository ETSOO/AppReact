import { NotificationMessageType, NotifierAntd } from '../../src';

// Root
const root: HTMLElement = document.body;

// Notifier
const notifier = new NotifierAntd({});

// Timer mock
// https://jestjs.io/docs/en/timer-mocks
jest.useFakeTimers();

test('Alert tests', () => {
    // Click
    const handleClick = jest.fn();

    // Add the notification
    notifier.alert('Alert message', handleClick, 'Custom Label');

    // Fast forward
    jest.runOnlyPendingTimers();

    // Button
    var button = root.getElementsByTagName('button');

    expect(button.length).toBe(1);
    expect(button[0].innerHTML).toContain('Custom Label');
    button[0].click();
    expect(handleClick).toBeCalled();
});

test('Confirm tests', () => {
    // Click
    const handleClick = jest.fn();

    // Add the notification
    notifier.confirm('Confirm message', undefined, handleClick);

    // Fast forward
    jest.runOnlyPendingTimers();

    // Button
    var button = root.getElementsByTagName('button');

    expect(button.length).toBe(2);
    expect(button[0].innerHTML).toContain('Cancel');
    button[0].click();
    expect(handleClick).toBeCalled();
});

test('Prompt tests', () => {
    // Click
    const handleClick = jest.fn();

    // Add the notification
    notifier.prompt('Prompt message', handleClick, undefined, {
        type: 'switch'
    });

    // Fast forward
    jest.runOnlyPendingTimers();

    // Button
    var button = root.getElementsByTagName('button');

    expect(button.length).toBe(2); // Switch will generate a button
    expect(button[1].innerHTML).toContain('OK');
    button[1].click();
    expect(handleClick).toBeCalled();
});

test('Message tests', () => {
    // Add the notification
    notifier.message(NotificationMessageType.Danger, 'Error Message');

    expect(root.innerHTML).toContain('Error Message');

    // Fast forward
    jest.runOnlyPendingTimers();

    expect(root.innerHTML).not.toContain('Error Message');
});
