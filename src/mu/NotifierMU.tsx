import {
    NotificationAlign,
    NotificationMessageType,
    NotificationRenderProps,
    NotificationType
} from '@etsoo/notificationbase';
import { DataTypes } from '@etsoo/shared';
import {
    Alert,
    AlertColor,
    AlertProps,
    AlertTitle,
    Backdrop,
    Box,
    Button,
    CircularProgress,
    CircularProgressProps,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fade,
    Slider,
    Snackbar,
    styled,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import { Error, Info, Help, Warning, Done } from '@mui/icons-material';
import React from 'react';
import { Labels } from '../app/Labels';
import {
    INotificationBaseReact,
    INotificationReact,
    NotificationReact,
    NotifierReact
} from '../notifier/Notifier';
import { DraggablePaperComponent } from './DraggablePaperComponent';
import { LoadingButton, LoadingButtonProps } from './LoadingButton';

// Custom icon dialog title bar
const IconDialogTitle = styled(DialogTitle)`
    ${({ theme }) => `
        cursor: move;
        display: flex;
        align-items: center;
        & .dialogTitle {
            font-weight: bold;
            font-size: 1.17em;
            padding-left: ${theme.spacing(1)};
        }
    `}
`;

/**
 * MU notification
 */
export class NotificationMU extends NotificationReact {
    // On return
    // Dismiss first, then run callback
    private async returnValue(value: any) {
        if (this.onReturn) {
            const result = await this.onReturn(value);
            if (result === false) return;
        }
        this.dismiss();
    }

    // Create alert
    private createAlert(_props: NotificationRenderProps, className: string) {
        const labels = Labels.NotificationMU;

        const {
            inputs,
            fullScreen,
            fullWidth = true,
            maxWidth,
            okLabel = labels.alertOK,
            primaryButton
        } = this.inputProps ?? {};

        let title = this.title;
        let icon: React.ReactNode;
        if (this.type === NotificationMessageType.Success) {
            icon = <Done color="primary" />;
            title ??= labels.success;
        } else if (this.type === NotificationMessageType.Info) {
            icon = <Info />;
            title ??= labels.info;
        } else if (this.type === NotificationMessageType.Warning) {
            icon = <Warning color="secondary" />;
            title ??= labels.warning;
        } else {
            icon = <Error color="error" />;
            title ??= labels.alertTitle;
        }

        const setupProps: LoadingButtonProps = {
            color: 'primary'
        };

        // Setup callback
        if (this.renderSetup) this.renderSetup(setupProps);

        return (
            <Dialog
                key={this.id}
                open={this.open}
                PaperComponent={DraggablePaperComponent}
                className={className}
                fullWidth={fullWidth}
                maxWidth={maxWidth}
                fullScreen={fullScreen}
            >
                <IconDialogTitle className="draggable-dialog-title">
                    {icon}
                    <span className="dialogTitle">{title}</span>
                </IconDialogTitle>
                <DialogContent>
                    <DialogContentText>{this.content}</DialogContentText>
                    {inputs}
                </DialogContent>
                <DialogActions>
                    <LoadingButton
                        {...setupProps}
                        onClick={async () => await this.returnValue(undefined)}
                        autoFocus
                        {...primaryButton}
                    >
                        {okLabel}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        );
    }

    // Create confirm
    private createConfirm(_props: NotificationRenderProps, className: string) {
        const labels = Labels.NotificationMU;
        const title = this.title ?? labels.confirmTitle;

        const {
            okLabel = labels.confirmYes,
            cancelLabel = labels.confirmNo,
            inputs,
            fullScreen,
            fullWidth = true,
            maxWidth,
            primaryButton
        } = this.inputProps ?? {};

        return (
            <Dialog
                key={this.id}
                open={this.open}
                PaperComponent={DraggablePaperComponent}
                className={className}
                fullWidth={fullWidth}
                maxWidth={maxWidth}
                fullScreen={fullScreen}
            >
                <IconDialogTitle className="draggable-dialog-title">
                    <Help color="action" />
                    <span className="dialogTitle">{title}</span>
                </IconDialogTitle>
                <DialogContent>
                    <DialogContentText>{this.content}</DialogContentText>
                    {inputs}
                </DialogContent>
                <DialogActions>
                    <LoadingButton
                        color="secondary"
                        onClick={async () => await this.returnValue(false)}
                    >
                        {cancelLabel}
                    </LoadingButton>
                    <LoadingButton
                        color="primary"
                        onClick={async () => await this.returnValue(true)}
                        autoFocus
                        {...primaryButton}
                    >
                        {okLabel}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        );
    }

    private createMessageColor(): AlertColor {
        if (this.type === NotificationMessageType.Danger) return 'error';
        if (this.type === NotificationMessageType.Success) return 'success';
        if (this.type === NotificationMessageType.Warning) return 'warning';
        return 'info';
    }

    // Create message
    private createMessage(_props: NotificationRenderProps, className: string) {
        if (!this.open) return <React.Fragment key={this.id}></React.Fragment>;

        const setupProps: AlertProps = {
            severity: this.createMessageColor(),
            variant: 'filled'
        };

        // Setup callback
        if (this.renderSetup) this.renderSetup(setupProps);

        return (
            <Fade in={true} key={this.id}>
                <Alert
                    {...setupProps}
                    onClose={() => this.dismiss()} // dismiss will trigger the onReturn callback
                    className={className}
                >
                    {this.title && <AlertTitle>{this.title}</AlertTitle>}
                    {this.content}
                </Alert>
            </Fade>
        );
    }

    // Create prompt
    private createPrompt(_props: NotificationRenderProps, className: string) {
        const labels = Labels.NotificationMU;
        const title = this.title ?? labels.promptTitle;

        const {
            cancelLabel = labels.promptCancel,
            okLabel = labels.promptOK,
            inputs,
            type,
            fullScreen,
            fullWidth = true,
            maxWidth,
            primaryButton,
            ...rest
        } = this.inputProps ?? {};

        const inputRef = React.createRef<HTMLInputElement>();
        const errorRef = React.createRef<HTMLSpanElement>();

        const setError = (error?: string) => {
            if (errorRef.current == null) return;
            errorRef.current.innerText = error ?? '';
        };

        const handleSubmit = async (
            event: React.MouseEvent<HTMLButtonElement>
        ) => {
            // Result
            let result:
                | boolean
                | string
                | void
                | PromiseLike<boolean | string | void> = undefined;

            const input = inputRef.current;

            if (this.onReturn) {
                // Inputs case, no HTMLForm set to value, set the current form
                if (inputs && value == null) value = event.currentTarget.form;

                if (input) {
                    if (type === 'date') {
                        const dateValue = input.valueAsDate;
                        if (dateValue == null && input.required) {
                            input.focus();
                            return;
                        }
                        result = this.onReturn(dateValue);
                    } else if (type === 'number') {
                        const numberValue = input.valueAsNumber;
                        if (isNaN(numberValue) && input.required) {
                            input.focus();
                            return;
                        }
                        result = this.onReturn(numberValue);
                    } else if (type === 'switch') {
                        const boolValue = input.value === 'true';
                        result = this.onReturn(boolValue);
                    } else {
                        const textValue = input.value.trim();
                        if (textValue === '' && input.required) {
                            input.focus();
                            return;
                        }
                        result = this.onReturn(textValue);
                    }
                } else if (value != null) {
                    result = this.onReturn(value);
                }
            }

            // Get the value
            // returns false to prevent default dismiss
            const v = await result;
            if (v === false) {
                input?.focus();
                return;
            }
            if (typeof v === 'string') {
                setError(v);
                input?.focus();
                return;
            }

            this.dismiss();
        };

        let localInputs: React.ReactNode;
        let value: any = undefined;

        if (inputs == null) {
            if (type === 'switch') {
                localInputs = (
                    <Switch
                        inputRef={inputRef}
                        {...rest}
                        value="true"
                        autoFocus
                        required
                    />
                );
            } else if (type === 'slider') {
                localInputs = <Slider onChange={(_e, v) => (value = v)} />;
            } else {
                localInputs = (
                    <TextField
                        inputRef={inputRef}
                        onChange={() => setError(undefined)}
                        autoFocus
                        margin="dense"
                        fullWidth
                        type={type}
                        required
                        {...rest}
                    />
                );
            }
        } else {
            localInputs = inputs;
        }

        return (
            <Dialog
                key={this.id}
                open={this.open}
                PaperComponent={DraggablePaperComponent}
                className={className}
                fullWidth={fullWidth}
                maxWidth={maxWidth}
                fullScreen={fullScreen}
            >
                <form>
                    <IconDialogTitle className="draggable-dialog-title">
                        <Info color="primary" />
                        <span className="dialogTitle">{title}</span>
                    </IconDialogTitle>
                    <DialogContent>
                        <DialogContentText>{this.content}</DialogContentText>
                        {localInputs}
                        <Typography
                            variant="caption"
                            display="block"
                            ref={errorRef}
                            color={(theme) => theme.palette.error.main}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color="secondary"
                            onClick={() => {
                                if (this.onReturn) this.onReturn(undefined);
                                this.dismiss();
                            }}
                        >
                            {cancelLabel}
                        </Button>
                        <LoadingButton
                            color="primary"
                            autoFocus
                            onClick={handleSubmit}
                            {...primaryButton}
                        >
                            {okLabel}
                        </LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }

    // Create loading
    private createLoading(_props: NotificationRenderProps, className: string) {
        // Properties
        const setupProps: CircularProgressProps = { color: 'primary' };

        const labels = Labels.NotificationMU;

        // Input props
        const { maxWidth = 'xs' } = this.inputProps ?? {};

        // Content
        let content = this.content;
        if (content === '@') content = labels.loading.toString();

        // Setup callback
        if (this.renderSetup) this.renderSetup(setupProps);

        return (
            <Backdrop
                key={this.id}
                className={className}
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.modal + 1
                }}
                open={this.open}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    flexWrap="nowrap"
                    alignItems="center"
                    sx={{
                        '& > :not(style) + :not(style)': {
                            marginTop: (theme) => theme.spacing(1)
                        }
                    }}
                >
                    <CircularProgress {...setupProps} />
                    {content && (
                        <Box
                            maxWidth={maxWidth === false ? undefined : maxWidth}
                        >
                            {content}
                        </Box>
                    )}
                </Box>
            </Backdrop>
        );
    }

    /**
     * Render method
     * @param props Props
     * @param className Style class name
     * @param classes Style classes
     */
    render(props: NotificationRenderProps, className: string) {
        // Loading bar
        if (this.type === NotificationType.Loading) {
            return this.createLoading(props, className);
        } else if (this.type === NotificationType.Confirm) {
            return this.createConfirm(props, className);
        } else if (this.type === NotificationType.Prompt) {
            return this.createPrompt(props, className);
        } else if (
            this.type === NotificationType.Error ||
            (this.modal && this.type in NotificationMessageType)
        ) {
            // Alert or modal message
            return this.createAlert(props, className);
        } else {
            return this.createMessage(props, className);
        }
    }
}

// Origin constructor generics
interface origin {
    vertical: 'top' | 'bottom';
    horizontal: DataTypes.HAlign;
}

/**
 * Antd notifier
 */
export class NotifierMU extends NotifierReact {
    /**
     * Create state and return provider
     * @param className Style class name
     * @returns Provider
     */
    static setup(className = 'notifier-mu') {
        // Create an instance
        const instance = new NotifierMU();
        const provider = instance.createProvider(className);
        NotifierReact.updateInstance(instance);
        return provider;
    }

    // Calculate origin from align property
    private static getOrigin(align: NotificationAlign): origin | undefined {
        if (align === NotificationAlign.TopLeft) {
            return {
                horizontal: 'left',
                vertical: 'top'
            };
        }

        if (align === NotificationAlign.TopCenter) {
            return {
                horizontal: 'center',
                vertical: 'top'
            };
        }

        if (align === NotificationAlign.TopRight) {
            return {
                horizontal: 'right',
                vertical: 'top'
            };
        }

        if (align === NotificationAlign.BottomLeft) {
            return {
                horizontal: 'left',
                vertical: 'bottom'
            };
        }

        if (align === NotificationAlign.BottomCenter) {
            return {
                horizontal: 'center',
                vertical: 'bottom'
            };
        }

        if (align === NotificationAlign.BottomRight) {
            return {
                horizontal: 'right',
                vertical: 'bottom'
            };
        }

        return {
            horizontal: 'center',
            vertical: 'top'
        };
    }

    /**
     * Create align container
     * @param align Align
     * @param children Children
     * @param options Other options
     */
    protected createContainer = (
        align: NotificationAlign,
        children: React.ReactNode[]
    ) => {
        // Each align group, class equal to something similar to 'align-topleft'
        const alignText = NotificationAlign[align].toLowerCase();
        let className = `align-${alignText}`;

        if (children.length === 0) {
            return <div key={`empty-${alignText}`} className={className} />;
        }

        if (align === NotificationAlign.Unknown) {
            // div container for style control
            return (
                <div key={`div-${alignText}`} className={className}>
                    {children}
                </div>
            );
        }

        // Use SnackBar for layout
        return (
            <Snackbar
                anchorOrigin={NotifierMU.getOrigin(align)}
                className={className}
                key={`layout-${alignText}`}
                sx={
                    align === NotificationAlign.Center
                        ? { position: 'fixed', top: '50%!important' }
                        : undefined
                }
                open
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    flexWrap="nowrap"
                    key={`box-${alignText}`}
                    sx={{
                        '& > :not(style) + :not(style)': {
                            marginTop: (theme) => theme.spacing(1)
                        }
                    }}
                >
                    {children}
                </Box>
            </Snackbar>
        );
    };

    /**
     * Add raw definition
     * @param data Notification data definition
     * @param modal Show as modal
     */
    protected addRaw(
        data: INotificationBaseReact,
        modal?: boolean
    ): INotificationReact {
        // Destruct
        const {
            type,
            content,
            title,
            align,
            timespan = modal ? 0 : undefined,
            ...rest
        } = data;

        // Setup
        const n = new NotificationMU(type, content, title, align, timespan);

        // Assign other properties
        Object.assign(n, rest);

        // Is modal
        if (modal != null) n.modal = modal;

        // Add to the collection
        this.add(n);

        // Return
        return n;
    }
}
