import { CustomFabProps } from './CustomFabProps';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import React from 'react';
import {
    Divider,
    Fab,
    IconButton,
    Link as MLink,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    PaperProps,
    PopoverOrigin
} from '@mui/material';
import { ListItemReact } from '../components/ListItemReact';
import { Link } from '@reach/router';

/**
 * More fab props
 */
export interface MoreFabProps extends CustomFabProps {
    /**
     * Actions
     */
    actions?: ListItemReact[];

    /**
     * Main icon
     */
    icon?: React.ReactNode;

    /**
     * Show as icon button
     */
    iconButton?: boolean;

    /**
     * This is the point on the anchor where the popover's
     * `anchorEl` will attach to
     */
    anchorOrigin?: PopoverOrigin;

    /**
     * Props applied to the [`Paper`](/api/paper/) element.
     * @default {}
     */
    PaperProps?: Partial<PaperProps>;

    /**
     * This is the point on the popover which
     * will attach to the anchor's origin
     */
    transformOrigin?: PopoverOrigin;
}

/**
 * More fab
 * @returns Component
 */
export function MoreFab(props: MoreFabProps) {
    // Destruct
    const {
        actions,
        anchorOrigin = {
            vertical: 'top',
            horizontal: 'right'
        },
        color = 'primary',
        icon = <MoreHorizIcon />,
        iconButton = false,
        PaperProps,
        size,
        title,
        transformOrigin = {
            vertical: 'bottom',
            horizontal: 'right'
        }
    } = props;

    // State
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement>();

    // Open state
    const open = Boolean(anchorEl);

    // Handle click
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    // Handle close
    const handleClose = () => {
        setAnchorEl(undefined);
    };

    // No actions
    if (actions == null || actions.length == 0) return <React.Fragment />;

    // Has any icon
    const hasIcon = actions.some((action) => action.icon != null);

    // Main
    const main = iconButton ? (
        <IconButton
            color={color}
            size={size}
            title={title}
            onClick={handleClick}
        >
            {icon}
        </IconButton>
    ) : (
        <Fab color={color} size={size} title={title} onClick={handleClick}>
            {icon}
        </Fab>
    );

    return (
        <React.Fragment>
            {main}
            <Menu
                disableScrollLock={true}
                anchorEl={anchorEl}
                anchorOrigin={anchorOrigin}
                keepMounted
                transformOrigin={transformOrigin}
                open={open}
                onClose={handleClose}
                PaperProps={PaperProps}
            >
                {actions.map(({ label, icon, action }, index) =>
                    label === '-' ? (
                        <Divider key={index} />
                    ) : (
                        <MenuItem
                            key={label}
                            {...(typeof action === 'string'
                                ? action.includes('://')
                                    ? { component: MLink, to: action }
                                    : { component: Link, to: action }
                                : {
                                      onClick: () => {
                                          handleClose();
                                          if (typeof action === 'function')
                                              action();
                                      }
                                  })}
                        >
                            {icon != null && (
                                <ListItemIcon>{icon}</ListItemIcon>
                            )}
                            <ListItemText inset={icon == null && hasIcon}>
                                {label}
                            </ListItemText>
                        </MenuItem>
                    )
                )}
            </Menu>
        </React.Fragment>
    );
}
