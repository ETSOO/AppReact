import { IconButton, IconButtonProps } from '@mui/material';
import React from 'react';
import { ReactUtils } from '../app/ReactUtils';

/**
 * IconButtonLink props
 */
export type IconButtonLinkProps = Omit<IconButtonProps, 'href' | 'onClick'> & {
    /**
     * To href
     */
    href: string;
};

/**
 * IconButtonLink
 * @param props Props
 * @returns Component
 */
export function IconButtonLink(props: IconButtonLinkProps) {
    // Destruct
    const { href, ...rest } = props;

    // Navigate
    const navigate = ReactUtils.getNavigateFn();

    // Layout
    return <IconButton {...rest} onClick={() => navigate(href)} />;
}
