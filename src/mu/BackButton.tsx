import { IconButton, IconButtonProps, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React from 'react';
import { ReactUtils } from '../app/ReactUtils';

/**
 * BackButton props
 */
export interface BackButtonProps extends IconButtonProps {}

/**
 * BackButton
 * @param props Props
 * @returns Component
 */
export function BackButton(props: BackButtonProps) {
    // Destruct
    const { color = 'primary', size = 'small', onClick, ...rest } = props;

    // Navigate
    const navigate = ReactUtils.getNavigateFn();

    // Theme
    const theme = useTheme();

    // Color
    const pColor =
        color != 'inherit' && color != 'default' && color in theme.palette
            ? theme.palette[color]
            : theme.palette.primary;

    // Click handler
    const onClickLocal = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) onClick(event);
        navigate(-1);
    };

    return (
        <IconButton
            aria-label="Back"
            color={color}
            size={size}
            onClick={onClickLocal}
            sx={{
                backgroundColor: pColor.contrastText,
                border: `1px solid ${pColor.light}`
            }}
            {...rest}
        >
            <ArrowBackIcon />
        </IconButton>
    );
}
