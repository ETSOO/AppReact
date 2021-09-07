import {
    Breakpoint,
    Button,
    ButtonProps,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton
} from '@mui/material';
import React from 'react';

export interface DialogButtonProps extends ButtonProps {
    /**
     * Dialog content
     */
    content: string;

    /**
     * Show content in pre component
     */
    contentPre?: boolean;

    /**
     * Default is label
     */
    dialogTitle?: string;

    /**
     * Disable the scroll lock behavior.
     * @default false
     */
    disableScrollLock?: boolean;

    /**
     * Show fullscreen dialog
     */
    fullScreen?: boolean;

    /**
     * Max width of the dialog
     */
    maxWidth?: Breakpoint | false;

    /**
     * Icon button
     */
    icon?: React.ReactNode;
}

/**
 * Dialog button
 * @param props Props
 * @returns Component
 */
export function DialogButton(props: DialogButtonProps) {
    // Destruct
    const {
        children,
        content,
        contentPre,
        dialogTitle,
        disableScrollLock,
        fullScreen,
        icon,
        maxWidth,
        onClick,
        ...rest
    } = props;

    // Open state
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // Onclick handler
    const onClickLocal = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Stop propagation
        event.stopPropagation();
        event.preventDefault();

        // Show dialog
        handleClickOpen();

        // Additional callback
        if (onClick) onClick(event);
    };

    // Layout
    return (
        <React.Fragment>
            {icon == null ? (
                <Button {...rest} onClick={onClickLocal}>
                    {children}
                </Button>
            ) : (
                <IconButton
                    {...rest}
                    onClick={onClickLocal}
                    title={children?.toString()}
                >
                    {icon}
                </IconButton>
            )}

            <Dialog
                disableScrollLock={disableScrollLock}
                fullScreen={fullScreen}
                maxWidth={maxWidth}
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>
                    {dialogTitle ? dialogTitle : children}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText component={contentPre ? 'pre' : 'span'}>
                        {content}
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}
