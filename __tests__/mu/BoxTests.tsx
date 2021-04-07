import React from 'react';
import ReactDOM from 'react-dom';
import { HBox } from '../../src';

// Root
const root = document.body;
const container: HTMLElement = document.createElement('div');
root.append(container);

// Render
ReactDOM.render(<HBox padding="10px">Hello, world!</HBox>, container);

test('HBox tests', () => {
    expect(container.innerHTML).toContain('Hello, world!');
});
