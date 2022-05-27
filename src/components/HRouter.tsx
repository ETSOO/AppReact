import React from 'react';
import { HistoryRouterProps, Router } from 'react-router-dom';

/**
 * Open to use HistoryRouter of react-router-dom
 * @param History router properties
 * @returns Component
 */
export function HRouter({ basename, children, history }: HistoryRouterProps) {
    const [state, setState] = React.useState({
        action: history.action,
        location: history.location
    });

    React.useLayoutEffect(() => history.listen(setState), [history]);

    return (
        <Router
            basename={basename}
            children={children}
            location={state.location}
            navigationType={state.action}
            navigator={history}
        />
    );
}
