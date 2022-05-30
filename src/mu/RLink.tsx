import { Link, LinkProps } from '@mui/material';
import React from 'react';
import { globalApp } from '../app/ReactApp';
import { useDelayedExecutor } from '../uses/useDelayedExecutor';

/**
 * Router Link properties
 */
export type RLinkProps = LinkProps & {
    delay?: number;
};

/**
 * Router Link
 * @param props Props
 * @returns Component
 */
export const RLink = React.forwardRef<HTMLAnchorElement, RLinkProps>(
    (props, ref) => {
        // Destruct
        const { delay = 0, href, target, onClick, ...rest } = props;

        const delayed =
            delay > 0
                ? useDelayedExecutor((href: string) => {
                      // Router push
                      globalApp.history.push(href);
                  }, delay)
                : null;

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

                if (delayed != null) delayed.call(undefined, href);
                else globalApp.history.push(href);
            }
        };

        React.useEffect(() => {
            return () => delayed?.clear();
        }, [delayed]);

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
