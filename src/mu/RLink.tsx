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
        const { href, target, onClick, ...rest } = props;

        // Click handler
        const onClickLocl = (
            event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
        ) => {
            if (onClick) onClick(event);

            if (
                !event.isDefaultPrevented() &&
                href &&
                (!target || target === '_self') && // Let browser handle "target=_blank" etc
                globalApp
            ) {
                // Prevent href action
                event.preventDefault();

                // Router push
                globalApp.history.push(href);
            }
        };

        // Component
        return (
            <Link
                {...rest}
                onClick={onClickLocl}
                href={href}
                target={target}
                ref={ref}
            />
        );
    }
);
