import { IAction } from '@etsoo/appscript';
import {
    NotificationAlign,
    NotificationContainer,
    NotificationDictionary,
    NotificationMessageType,
    NotificationParameters,
    NotificationReturn,
    NotificationType
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
import { Close, Error, Info, Help } from '@material-ui/icons';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import React from 'react';
import Draggable from 'react-draggable';
import {
    INotificationReact,
    INotifierReact,
    NotificationReact
} from '../notifier/Notifier';
import { State } from '../states/State';
import { Color } from '@material-ui/core/Alert';

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

interface AlertProps {
    buttonLabel?: string;
}

interface ConfirmProps {
    yesLabel?: string;
    noLabel?: string;
}

interface PromptProps extends ConfirmProps {}

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
    private createAlert(className: string, classes: ClassNameMap<string>) {
        // Props
        var props: AlertProps = {};

        // Setup callback
        if (this.renderSetup) this.renderSetup(props);

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
                    <h2>{this.title}</h2>
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
                        {props.buttonLabel}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    // Create confirm
    private createConfirm(className: string, classes: ClassNameMap<string>) {
        // Props
        var props: ConfirmProps = {};

        // Setup callback
        if (this.renderSetup) this.renderSetup(props);

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
                    <h2>{this.title}</h2>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>{this.content}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="secondary"
                        onClick={() => this.returnValue(false)}
                    >
                        {props.noLabel}
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => this.returnValue(true)}
                        autoFocus
                    >
                        {props.yesLabel}
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
    private createMessage(className: string, classes: ClassNameMap<string>) {
        if (!this.open) return <React.Fragment key={this.id}></React.Fragment>;

        return (
            <Fade in={true} key={this.id}>
                <Alert
                    severity={this.createMessageColor()}
                    variant="filled"
                    onClose={() => this.returnValue(undefined)}
                >
                    {this.title && <AlertTitle>{this.title}</AlertTitle>}
                    {this.content}
                </Alert>
            </Fade>
        );
    }

    // Create prompt
    private createPrompt(className: string, classes: ClassNameMap<string>) {
        // Props
        var props: PromptProps = {};

        // Setup callback
        if (this.renderSetup) this.renderSetup(props);

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
            input = <Switch inputRef={inputRef} {...rest} autoFocus />;
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
                    <h2>{this.title}</h2>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>{this.content}</DialogContentText>
                    {input}
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={() => this.dismiss()}>
                        {props.noLabel}
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => returnInputValue()}
                        autoFocus
                    >
                        {props.yesLabel}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    // Create loading
    private createLoading(className: string, classes: ClassNameMap<string>) {
        // Properties
        const props: CircularProgressProps = { color: 'primary' };

        // Setup callback
        if (this.renderSetup) this.renderSetup(props);

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
                    <CircularProgress {...props} />
                    <Box width="75%" maxWidth={640}>
                        {this.content}
                    </Box>
                </Box>
            </Backdrop>
        );
    }

    /**
     * Render method
     * @param className Style class name
     * @param classes Style classes
     */
    render(className: string, classes: ClassNameMap<string>) {
        // Loading bar
        if (this.type === NotificationType.Loading) {
            return this.createLoading(className, classes);
        } else if (this.type === NotificationType.Error) {
            return this.createAlert(className, classes);
        } else if (this.type === NotificationType.Confirm) {
            return this.createConfirm(className, classes);
        } else if (this.type === NotificationType.Prompt) {
            return this.createPrompt(className, classes);
        } else {
            return this.createMessage(className, classes);
        }
    }
}

/**
 * Action to manage the notifier
 */
interface INotifierMUAction extends IAction {
    /**
     * Notification
     */
    notification: INotificationReact;

    /**
     * Add or dismiss
     */
    dismiss: boolean;
}

// Origin constructor generics
interface origin {
    vertical: 'top' | 'bottom';
    horizontal: DataTypes.HAlign;
}

/**
 * Antd notifier
 */
export class NotifierMU
    extends NotificationContainer<React.ReactNode>
    implements INotifierReact {
    // Instance
    private static _instance: NotifierMU;

    /**
     * Singleton instance
     */
    static get instance() {
        return NotifierMU._instance;
    }

    // State update
    private static stateUpdate: React.Dispatch<INotifierMUAction>;

    /**
     * Create state and return provider
     * @returns Provider
     */
    static setup(
        labels: DataTypes.ReadonlyStringDictionary,
        className = 'notifier-mu',
        itemClassName = 'notifier-mu-item'
    ) {
        // Create an instance
        NotifierMU._instance = new NotifierMU(labels);

        // Style
        const useStyles = makeStyles<Theme, { gap: number }>((theme) => ({
            screenCenter: {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            },
            listBox: {
                '& >*:not(:first-child)': {
                    marginTop: ({ gap }) => theme.spacing(gap)
                }
            },
            backdrop: {
                zIndex: `${theme.zIndex.modal + 1}!important` as any,
                color: 'transparent'
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

        // Custom creator
        const creator = (
            state: NotificationDictionary<React.ReactNode>,
            update: React.Dispatch<INotifierMUAction>
        ) => {
            // Hold the current state update
            NotifierMU.stateUpdate = update;

            // Styles
            const classes = useStyles({ gap: 1 });

            // Aligns collection
            const aligns: React.ReactNode[] = [];
            for (const align in state) {
                // Notifications under the align
                const notifications = state[align];

                // UI collections
                const ui = notifications.map((notification) =>
                    notification.render(itemClassName, classes)
                );

                // Add to the collection
                aligns.push(
                    NotifierMU.createContainer(Number(align), ui, classes)
                );
            }

            // Generate the component
            return React.createElement('div', { className }, aligns);
        };

        // Create state
        const { provider } = State.create(
            (
                state: NotificationDictionary<React.ReactNode>,
                _action: INotifierMUAction
            ) => {
                // Collection update is done with NotificationContainer
                return { ...state };
            },
            NotifierMU._instance.notifications,
            creator
        );

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

        return undefined;
    }

    // Align group container creator
    private static createContainer = (
        align: NotificationAlign,
        children: React.ReactNode[],
        classes: ClassNameMap<string>
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
            className += ' ' + classes.screenCenter;

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
                    className={classes.listBox}
                >
                    {children}
                </Box>
            </Snackbar>
        );
    };

    // Labels
    private labels: DataTypes.ReadonlyStringDictionary;

    // Last loading
    private lastLoading?: INotificationReact;

    /**
     * Constructor
     * @param labels Labels
     */
    private constructor(labels: DataTypes.ReadonlyStringDictionary) {
        super((notification, dismiss) => {
            NotifierMU.stateUpdate({ notification, dismiss });
        });

        // Labels
        this.labels = labels;
    }

    /**
     * Report error
     * @param error Error message
     * @param callback Callback
     * @param buttonLabel Confirm button label
     */
    alert(
        error: string,
        callback?: NotificationReturn<void>,
        buttonLabel?: string
    ): void {
        // Setup
        const n = new NotificationMU(
            NotificationType.Error,
            error,
            this.labels.warning ?? 'Warning'
        );

        // Callback
        n.onReturn = callback;

        // Render setup
        n.renderSetup = (options: AlertProps) => {
            options.buttonLabel = buttonLabel ?? this.labels.ok ?? 'OK';
        };

        // Add to the collection
        this.add(n);
    }

    /**
     * Confirm action
     * @param message Message
     * @param title Title
     * @param callback Callback
     */
    confirm(
        message: string,
        title?: string,
        callback?: NotificationReturn<boolean>
    ): void {
        // Setup
        const n = new NotificationMU(
            NotificationType.Confirm,
            message,
            title ?? this.labels.confirm ?? 'Confirm'
        );

        // Render setup
        n.renderSetup = (options: ConfirmProps) => {
            options.yesLabel = this.labels.ok ?? 'OK';
            options.noLabel = this.labels.cancel ?? 'Cancel';
        };

        // Callback
        n.onReturn = callback;

        // Add to the collection
        this.add(n);
    }

    /**
     * Hide loading
     */
    hideLoading(): void {
        this.lastLoading?.dismiss();
    }

    /**
     * Show a message
     * @param type Message type
     * @param message Message
     * @param title Title
     * @param parameters Parameters
     */
    message(
        type: NotificationMessageType,
        message: string,
        title?: string,
        parameters?: NotificationParameters
    ) {
        // Destruct
        const { align, timespan, callback } = parameters ?? {};

        // New item
        const n = new NotificationMU(type, message, title, align);

        // Additional parameters
        n.onReturn = callback;
        if (timespan) n.timespan = timespan;

        // Add to the collection
        this.add(n);

        // Return it
        return n;
    }

    /**
     * Prompt action
     * @param message Message
     * @param callback Callback
     * @param title Title
     * @param props More properties
     */
    prompt(
        message: string,
        callback: NotificationReturn<string>,
        title?: string,
        props?: any
    ): void {
        // Setup
        const n = new NotificationMU(
            NotificationType.Prompt,
            message,
            title ?? this.labels.input ?? 'Input'
        );

        // Additional parameters
        n.inputProps = props;

        // Render setup
        n.renderSetup = (options: PromptProps) => {
            options.yesLabel = this.labels.ok ?? 'OK';
            options.noLabel = this.labels.cancel ?? 'Cancel';
        };

        // Callback
        n.onReturn = callback;

        // Add to the collection
        this.add(n);
    }

    /**
     * Show loading
     * @param title Title, pass '' to hide the text
     */
    showLoading(title?: string): void {
        // Setup
        const n = new NotificationMU(
            NotificationType.Loading,
            title ?? this.labels.loading ?? 'Loading...'
        );

        // Keep the reference
        this.lastLoading = n;

        // Add to the collection
        this.add(n);
    }
}
