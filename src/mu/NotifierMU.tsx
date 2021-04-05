import {
    INotificaseBase,
    NotificationAlign,
    NotificationMessageType,
    NotificationRenderProps,
    NotificationType,
    NotifierLabelKeys
} from '@etsoo/notificationbase';
import { DataTypes, DomUtils } from '@etsoo/shared';
import {
    Alert,
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
    makeStyles,
    Paper,
    PaperProps,
    Slider,
    Snackbar,
    Switch,
    TextField,
    Theme
} from '@material-ui/core';
import { Error, Info, Help } from '@material-ui/icons';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import React from 'react';
import Draggable from 'react-draggable';
import {
    INotificationReact,
    NotificationReact,
    NotifierReact
} from '../notifier/Notifier';
import { AlertProps, Color } from '@material-ui/core/Alert';

// Draggable Paper component for Dialog
function PaperComponent(props: PaperProps) {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    );
}

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
        props: NotificationRenderProps,
        className: string,
        classes: ClassNameMap<string>
    ) {
        const labels = props.labels;
        const title =
            this.title ?? labels[NotifierLabelKeys.alertTitle] ?? 'Warning';

        const ok = labels[NotifierLabelKeys.alertOK] ?? 'OK';

        return (
            <Dialog
                key={this.id}
                open={this.open}
                PaperComponent={PaperComponent}
                className={className}
            >
                <DialogTitle
                    disableTypography
                    className={classes.iconTitle}
                    id="draggable-dialog-title"
                >
                    <Error color="error" />
                    <h2>{title}</h2>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>{this.content}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        onClick={() => this.returnValue(undefined)}
                        autoFocus
                    >
                        {ok}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    // Create confirm
    private createConfirm(
        props: NotificationRenderProps,
        className: string,
        classes: ClassNameMap<string>
    ) {
        const labels = props.labels;
        const title =
            this.title ?? labels[NotifierLabelKeys.confirmTitle] ?? 'Confirm';

        const noLabel = labels[NotifierLabelKeys.confirmNo] ?? 'Cancel';
        const yesLabel = labels[NotifierLabelKeys.confirmYes] ?? 'OK';

        return (
            <Dialog
                key={this.id}
                open={this.open}
                PaperComponent={PaperComponent}
                className={className}
            >
                <DialogTitle
                    disableTypography
                    className={classes.iconTitle}
                    id="draggable-dialog-title"
                >
                    <Help color="action" />
                    <h2>{title}</h2>
                </DialogTitle>
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

    private createMessageColor(): Color {
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
                    onClose={() => this.returnValue(undefined)}
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
        props: NotificationRenderProps,
        className: string,
        classes: ClassNameMap<string>
    ) {
        const labels = props.labels;
        const title =
            this.title ?? labels[NotifierLabelKeys.promptTitle] ?? 'Input';

        const noLabel = labels[NotifierLabelKeys.promptCancel] ?? 'Cancel';
        const yesLabel = labels[NotifierLabelKeys.promptOK] ?? 'OK';

        const { type, ...rest } = this.inputProps;

        const returnInputValue = () => {
            if (this.onReturn) {
                if (inputRef.current) {
                    if (type === 'date') {
                        const dateValue = inputRef.current.valueAsDate;
                        if (dateValue == null) {
                            inputRef.current.focus();
                            return;
                        } else {
                            this.onReturn(dateValue);
                        }
                    } else if (type === 'number') {
                        const numberValue = inputRef.current.valueAsNumber;
                        if (isNaN(numberValue)) {
                            inputRef.current.focus();
                            return;
                        } else {
                            this.onReturn(numberValue);
                        }
                    } else if (type === 'switch') {
                        const boolValue = inputRef.current.value == 'true';
                        this.onReturn(boolValue);
                    } else {
                        const textValue = inputRef.current.value;
                        if (textValue) {
                            this.onReturn(textValue);
                        } else {
                            inputRef.current.focus();
                            return;
                        }
                    }
                } else if (value != null) {
                    this.onReturn(value);
                }
            }

            this.dismiss();
        };

        let inputRef = React.createRef<HTMLInputElement>();
        let value: any = undefined;
        let input: any;
        if (type === 'switch') {
            input = (
                <Switch inputRef={inputRef} {...rest} value="true" autoFocus />
            );
        } else if (type === 'slider') {
            input = <Slider onChange={(_e, v) => (value = v)} />;
        } else {
            input = (
                <TextField
                    autoFocus
                    fullWidth
                    inputRef={inputRef}
                    type={type}
                    {...rest}
                />
            );
        }

        return (
            <Dialog
                key={this.id}
                open={this.open}
                PaperComponent={PaperComponent}
                className={className}
            >
                <DialogTitle
                    disableTypography
                    className={classes.iconTitle}
                    id="draggable-dialog-title"
                >
                    <Info color="primary" />
                    <h2>{title}</h2>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>{this.content}</DialogContentText>
                    {input}
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={() => this.dismiss()}>
                        {noLabel}
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => returnInputValue()}
                        autoFocus
                    >
                        {yesLabel}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    // Create loading
    private createLoading(
        props: NotificationRenderProps,
        className: string,
        classes: ClassNameMap<string>
    ) {
        // Properties
        const setupProps: CircularProgressProps = { color: 'primary' };

        // Content
        let content = this.content;
        if (content === '@')
            content = props.labels[NotifierLabelKeys.loading] ?? 'Loading...';

        // Setup callback
        if (this.renderSetup) this.renderSetup(setupProps);

        return (
            <Backdrop
                key={this.id}
                className={DomUtils.mergeClasses(className, classes.backdrop)}
                open={this.open}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    flexWrap="nowrap"
                    alignItems="center"
                    className={classes.loadingBox}
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
        } else if (this.type === NotificationType.Error) {
            return this.createAlert(props, className, classes);
        } else if (this.type === NotificationType.Confirm) {
            return this.createConfirm(props, className, classes);
        } else if (this.type === NotificationType.Prompt) {
            return this.createPrompt(props, className, classes);
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

        // Style
        const useStyles = makeStyles<Theme, { gap: number }>((theme) => ({
            screenCenter: {
                position: 'fixed',
                top: '50%',
                right: 'inherit!important'
            },
            listBox: {
                '& >*:not(:first-child)': {
                    marginTop: ({ gap }) => theme.spacing(gap)
                }
            },
            backdrop: {
                zIndex: `${theme.zIndex.modal + 1}!important` as any,
                color: '#fff'
            },
            iconTitle: {
                cursor: 'move',
                minWidth: '360px',
                display: 'flex',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start',
                alignItems: 'center',
                '& h2': {
                    paddingLeft: theme.spacing(1)
                }
            },
            loadingBox: {
                '& >*:not(:first-child)': {
                    marginTop: theme.spacing(1)
                }
            }
        }));

        return NotifierReact.instance.createProvider(className, () =>
            useStyles({ gap: 1 })
        );
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
        options: ClassNameMap<string>
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

        if (align === NotificationAlign.Center)
            className += ' ' + options.screenCenter;

        // Use SnackBar for layout
        return (
            <Snackbar
                anchorOrigin={NotifierMU.getOrigin(align)}
                className={className}
                key={`layout-${alignText}`}
                open
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    flexWrap="nowrap"
                    key={`box-${alignText}`}
                    className={options.listBox}
                >
                    {children}
                </Box>
            </Snackbar>
        );
    };

    /**
     * Add raw definition
     * @param data Notification data definition
     */
    protected addRaw(data: INotificaseBase): INotificationReact {
        // Destruct
        const { type, content, title, align, ...rest } = data;

        // Setup
        const n = new NotificationMU(type, content, title, align);

        // Assign other properties
        Object.assign(n, rest);

        // Add to the collection
        this.add(n);

        // Return
        return n;
    }
}
