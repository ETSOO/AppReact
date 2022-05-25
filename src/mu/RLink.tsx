import { Link, LinkProps } from '@mui/material';
import {
    Link as RouterLink,
    LinkProps as RouterLinkProps
} from 'react-router-dom';
import React from 'react';

/**
 * Router Link props
 */
export type RLinkProps = LinkProps & RouterLinkProps;

/**
 * Router Link
 * @param props Props
 * @returns Component
 */
export function RLink(props: RLinkProps) {
    return <Link component={RouterLink} {...props} />;
}
