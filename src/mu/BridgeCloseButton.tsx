import { BridgeUtils, IBridgeHost } from '@etsoo/appscript';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, IconButtonProps } from '@mui/material';
import React from 'react';
import { globalApp } from '../app/ReactApp';

/**
 * Bridge close button props
 */
export interface BridgeCloseButtonProps extends IconButtonProps {
    /**
     * Validate the host
     * @param host Host
     */
    validate(host: IBridgeHost): boolean;
}

/**
 * Bridge close button
 * @param props Props
 * @returns Component
 */
export function BridgeCloseButton(props: BridgeCloseButtonProps) {
    // Destruct
    const {
        onClick,
        title = typeof globalApp === 'undefined'
            ? 'Close'
            : globalApp.get('close'),
        validate,
        ...rest
    } = props;

    // Host
    const host = BridgeUtils.host;

    if (host == null || (validate && validate(host) === false)) {
        return <React.Fragment />;
    }

    // Click handler
    const onClickLocal = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) onClick(event);
        host.exit();
    };

    return (
        <IconButton
            aria-label="close"
            color="primary"
            onClick={onClickLocal}
            sx={{
                position: 'absolute',
                top: (theme) => theme.spacing(1),
                right: (theme) => theme.spacing(1)
            }}
            {...rest}
        >
            <CloseIcon />
        </IconButton>
    );
}
