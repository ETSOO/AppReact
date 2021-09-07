import { Button, ButtonProps } from '@mui/material';
import { useNavigate } from '@reach/router';
import React from 'react';

/**
 * ButtonLink props
 */
export type ButtonLinkProps = Omit<ButtonProps, 'href' | 'onClick'> & {
    /**
     * To href
     */
    href: string;
};

/**
 * ButtonLink
 * @param props Props
 * @returns Component
 */
export function ButtonLink(props: ButtonLinkProps) {
    // Destruct
    const { href, ...rest } = props;

    // Navigate
    const navigate = useNavigate();

    // Layout
    return <Button {...rest} onClick={() => navigate(href)} />;
}
