import { Link, LinkProps } from '@mui/material';
import React from 'react';
import { globalApp } from '../app/ReactApp';

/**
 * Router Link
 * @param props Props
 * @returns Component
 */
export function RLink(props: LinkProps) {
    // Destruct
    const { href, onClick, ...rest } = props;

    // Click handler
    const onClickLocl = (
        event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
        if (onClick) onClick(event);

        if (href && globalApp) {
            globalApp.history.push(href);
        }
    };

    // Component
    return <Link {...rest} onClick={onClickLocl} />;
}
