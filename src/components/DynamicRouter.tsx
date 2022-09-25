import { BridgeUtils, IBridgeHost } from '@etsoo/appscript';
import React from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

/**
 * Dynamic router props
 */
export type DynamicRouterProps = {
    /**
     * basename of the router
     */
    basename?: string;
};

function getEntries(host: IBridgeHost) {
    const startUrl = host.getStartUrl();
    return startUrl == null ? undefined : [startUrl];
}

/**
 * Dynamic router
 * @param props Props
 * @returns Component
 */
export function DynamicRouter(
    props: React.PropsWithChildren<DynamicRouterProps>
) {
    // Destruct
    const { basename, children } = props;

    // Layout
    const host = BridgeUtils.host;
    return host == null ? (
        <BrowserRouter basename={basename}>{children}</BrowserRouter>
    ) : (
        <MemoryRouter basename={basename} initialEntries={getEntries(host)}>
            {children}
        </MemoryRouter>
    );
}
