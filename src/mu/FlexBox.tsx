import { Stack, StackProps } from '@mui/material';
import React from 'react';

/**
 * Horizonal box
 * @param props Props
 * @returns Component
 */
export function HBox(props: Exclude<StackProps, 'ref'>) {
    return <Stack direction="row" width="100%" {...props} />;
}

/**
 * Vertial box
 * @param props Props
 * @returns Component
 */
export function VBox(props: Exclude<StackProps, 'ref'>) {
    return <Stack direction="column" {...props} />;
}
