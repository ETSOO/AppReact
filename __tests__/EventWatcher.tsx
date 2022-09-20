import { render, screen } from '@testing-library/react';
import React from 'react';
import { EventWatcher } from '../src/app/EventWatcher';

function App(props: { callback: () => void }) {
    const { callback } = props;
    const watcher = new EventWatcher();

    React.useEffect(() => {
        watcher.add({
            type: 'click',
            action: (_event) => callback(),
            once: true
        });
    }, []);
    return <button onClick={(event) => watcher.do(event)}></button>;
}

test('Tests for EventWatcher', () => {
    const callback = jest.fn();
    render(<App callback={callback} />);
    const button = screen.getByRole<HTMLButtonElement>('button');
    button.click();
    expect(callback).toBeCalled();
    button.click();
    expect(callback).toBeCalledTimes(1);
});
