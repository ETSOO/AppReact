import { IconButton, IconButtonProps } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React from 'react';
import { useNavigate } from '@reach/router';

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
    const navigate = useNavigate();

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
                border: (theme) =>
                    `1px solid ${
                        (() =>
                            color != 'inherit' &&
                            color != 'default' &&
                            color in theme.palette
                                ? theme.palette[color]
                                : theme.palette.primary)().light
                    }`
            }}
            {...rest}
        >
            <ArrowBackIcon />
        </IconButton>
    );
}
