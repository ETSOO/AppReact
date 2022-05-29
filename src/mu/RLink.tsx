import { Link, LinkProps } from '@mui/material';
import React from 'react';
import { globalApp } from '../app/ReactApp';

/**
 * Router Link
 * @param props Props
 * @returns Component
 */
export const RLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
    (props, ref) => {
        // Destruct
        const { href, onClick, ...rest } = props;

        // Click handler
        const onClickLocl = (
            event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
        ) => {
            if (onClick) onClick(event);

            if (!event.isDefaultPrevented && href && globalApp) {
                // Router push
                globalApp.history.push(href);

                // Cancel further processing
                event.preventDefault();
                event.stopPropagation();
            }
        };

        // Component
        return <Link {...rest} onClick={onClickLocl} href={href} ref={ref} />;
    }
);
