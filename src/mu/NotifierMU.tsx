import {
    INotificaseBase,
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
    ClassNameMap,
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
    TextField
} from '@mui/material';
import { Error, Info, Help, Warning, Done } from '@mui/icons-material';
import React from 'react';
import { Labels } from '../app/Labels';
import {
    INotificationReact,
    NotificationReact,
    NotifierReact
} from '../notifier/Notifier';
import { DraggablePaperComponent } from './DraggablePaperComponent';
import { NotifierPromptProps } from './NotifierPromptProps';
import { LoadingButton } from './LoadingButton';

// Custom icon dialog title bar
const IconDialogTitle = styled(DialogTitle)`
    ${({ theme }) => `
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
    private returnValue(value: any) {
        this.dismiss();
        if (this.onReturn) this.onReturn(value);
    }

    // Create alert
    private createAlert(
        _props: NotificationRenderProps,
        className: string,
        classes: ClassNameMap<string>
    ) {
        const labels = Labels.NotificationMU;

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

        return (
            <Dialog
                key={this.id}
                open={this.open}
                PaperComponent={DraggablePaperComponent}
                className={className}
            >
                <IconDialogTitle
                    className={classes.iconTitle}
                    id="draggable-dialog-title"
                >
                    {icon}
                    <span className="dialogTitle">{title}</span>
                </IconDialogTitle>
                <DialogContent>
                    <DialogContentText>{this.content}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        onClick={() => this.returnValue(undefined)}
                        autoFocus
                    >
                        {labels.alertOK}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    // Create confirm
    private createConfirm(
        _props: NotificationRenderProps,
        className: string,
        classes: ClassNameMap<string>
    ) {
        const labels = Labels.NotificationMU;
        const title = this.title ?? labels.confirmTitle;

        const noLabel = labels.confirmNo;
        const yesLabel = labels.confirmYes;

        return (
            <Dialog
                key={this.id}
                open={this.open}
                PaperComponent={DraggablePaperComponent}
                className={className}
            >
                <IconDialogTitle
                    className={classes.iconTitle}
                    id="draggable-dialog-title"
                >
                    <Help color="action" />
                    <span className="dialogTitle">{title}</span>
                </IconDialogTitle>
                <DialogContent>
                    <DialogContentText>{this.content}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="secondary"
                        onClick={() => this.returnValue(false)}
                    >
                        {noLabel}
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => this.returnValue(true)}
                        autoFocus
                    >
                        {yesLabel}
                    </Button>
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
    private createMessage(
        _props: NotificationRenderProps,
        className: string,
        _classes: ClassNameMap<string>
    ) {
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
    private createPrompt(
        _props: NotificationRenderProps,
        className: string,
        classes: ClassNameMap<string>
    ) {
        const labels = Labels.NotificationMU;
        const title = this.title ?? labels.promptTitle;

        const {
            cancelLabel = labels.promptCancel,
            okLabel = labels.promptOK,
            inputs,
            type,
            ...rest
        } = this.inputProps as NotifierPromptProps;

        const handleSubmit = async (
            event: React.MouseEvent<HTMLButtonElement>
        ) => {
            // Result
            let result: boolean | void | PromiseLike<boolean | void> =
                undefined;

            if (this.onReturn) {
                // Inputs case, no HTMLForm set to value, set the current form
                if (inputs && value == null) value = event.currentTarget.form;

                if (inputRef.current) {
                    if (type === 'date') {
                        const dateValue = inputRef.current.valueAsDate;
                        if (dateValue == null) {
                            inputRef.current.focus();
                            return;
                        }
                        result = this.onReturn(dateValue);
                    } else if (type === 'number') {
                        const numberValue = inputRef.current.valueAsNumber;
                        if (isNaN(numberValue)) {
                            inputRef.current.focus();
                            return;
                        }
                        result = this.onReturn(numberValue);
                    } else if (type === 'switch') {
                        const boolValue = inputRef.current.value === 'true';
                        result = this.onReturn(boolValue);
                    } else {
                        const textValue = inputRef.current.value.trim();
                        if (textValue === '') {
                            inputRef.current.focus();
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
            if (v === false) return;

            this.dismiss();
        };

        let localInputs: React.ReactNode;
        let inputRef = React.createRef<HTMLInputElement>();
        let value: any = undefined;

        if (inputs == null) {
            if (type === 'switch') {
                localInputs = (
                    <Switch
                        inputRef={inputRef}
                        {...rest}
                        value="true"
                        autoFocus
                    />
                );
            } else if (type === 'slider') {
                localInputs = <Slider onChange={(_e, v) => (value = v)} />;
            } else {
                localInputs = (
                    <TextField
                        inputRef={inputRef}
                        autoFocus
                        fullWidth
                        type={type}
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
            >
                <form>
                    <IconDialogTitle
                        className={classes.iconTitle}
                        id="draggable-dialog-title"
                    >
                        <Info color="primary" />
                        <span className="dialogTitle">{title}</span>
                    </IconDialogTitle>
                    <DialogContent>
                        <DialogContentText>{this.content}</DialogContentText>
                        {localInputs}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color="secondary"
                            onClick={() => this.dismiss()}
                        >
                            {cancelLabel}
                        </Button>
                        <LoadingButton
                            color="primary"
                            autoFocus
                            onClick={handleSubmit}
                        >
                            {okLabel}
                        </LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }

    // Create loading
    private createLoading(
        _props: NotificationRenderProps,
        className: string,
        _classes: ClassNameMap<string>
    ) {
        // Properties
        const setupProps: CircularProgressProps = { color: 'primary' };

        const labels = Labels.NotificationMU;

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
                    {content && <Box maxWidth={640}>{content}</Box>}
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
    render(
        props: NotificationRenderProps,
        className: string,
        classes: ClassNameMap<string>
    ) {
        // Loading bar
        if (this.type === NotificationType.Loading) {
            return this.createLoading(props, className, classes);
        } else if (this.type === NotificationType.Confirm) {
            return this.createConfirm(props, className, classes);
        } else if (this.type === NotificationType.Prompt) {
            return this.createPrompt(props, className, classes);
        } else if (
            this.type === NotificationType.Error ||
            (this.modal && this.type in NotificationMessageType)
        ) {
            // Alert or modal message
            return this.createAlert(props, className, classes);
        } else {
            return this.createMessage(props, className, classes);
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
        NotifierReact.updateInstance(new NotifierMU());
        return NotifierReact.instance.createProvider(className);
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
        children: React.ReactNode[],
        _options: ClassNameMap<string>
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
        data: INotificaseBase,
        modal?: boolean
    ): INotificationReact {
        // Destruct
        const { type, content, title, align, timespan, ...rest } = data;

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
