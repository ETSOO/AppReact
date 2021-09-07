import { CustomFabProps } from './CustomFabProps';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import React from 'react';
import {
    Divider,
    Fab,
    Link,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem
} from '@mui/material';

/**
 * More action interface
 */
export interface MoreAction {
    /**
     * Label, - for divider
     */
    label: string;

    /**
     * Icon
     */
    icon?: React.ReactNode;

    /**
     * Url
     */
    url?: string;

    /**
     * Action
     */
    action?: (() => PromiseLike<void>) | (() => void);
}

/**
 * More fab props
 */
export interface MoreFabProps extends CustomFabProps {
    /**
     * Actions
     */
    actions?: MoreAction[];
}

/**
 * More fab
 * @returns Component
 */
export function MoreFab(props: MoreFabProps) {
    // Destruct
    const { actions, size, title } = props;

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

    return (
        <React.Fragment>
            <Fab
                color="primary"
                size={size}
                title={title}
                onClick={handleClick}
            >
                <MoreHorizIcon />
            </Fab>
            <Menu
                disableScrollLock={true}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                open={open}
                onClose={handleClose}
            >
                {actions.map((action, index) =>
                    action.label === '-' ? (
                        <Divider key={index} />
                    ) : (
                        <MenuItem
                            key={action.label}
                            {...(action.url
                                ? { component: Link, to: action.url }
                                : {
                                      onClick: () => {
                                          handleClose();
                                          if (action.action != null)
                                              action.action();
                                      }
                                  })}
                        >
                            {action.icon != null && (
                                <ListItemIcon>{action.icon}</ListItemIcon>
                            )}
                            <ListItemText inset={hasIcon}>
                                {action.label}
                            </ListItemText>
                        </MenuItem>
                    )
                )}
            </Menu>
        </React.Fragment>
    );
}
