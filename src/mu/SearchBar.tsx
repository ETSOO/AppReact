import { Button, Drawer, IconButton, Stack, useTheme } from '@material-ui/core';
import React from 'react';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { useDimensions } from '../uses/useDimensions';
import { Utils as AppUtils } from '../app/Utils';
import { DomUtils } from '@etsoo/shared';
import { Labels } from '../app/Labels';

/**
 * Search bar props
 */
export interface SearchBarProps {
    /**
     * Style class name
     */
    className?: string;

    /**
     * Fields
     */
    fields: React.ReactElement[];

    /**
     * On submit callback
     */
    onSubmit: (data: FormData, reset: boolean) => void | PromiseLike<void>;
}

// Cached width attribute name
const cachedWidthName: string = 'data-cached-width';

// Reset form
const resetForm = (form: HTMLFormElement) => {
    for (const input of form.elements) {
        // Ignore disabled inputs
        if ('disabled' in input && (input as any).disabled) continue;

        // All non hidden inputs
        if (input instanceof HTMLInputElement) {
            // Ignore readOnly inputs
            if (input.readOnly) continue;

            if (input.type !== 'hidden' || input.dataset.reset === 'true') {
                AppUtils.triggerChange(input, '', true);
            }
            continue;
        }

        // All selects
        if (input instanceof HTMLSelectElement) {
            if (input.options.length > 0 && input.options[0].value === '') {
                input.selectedIndex = 0;
            } else {
                input.selectedIndex = -1;
            }
            continue;
        }
    }
};

// Disable inputs avoid auto trigger change events for them
const setChildState = (child: Element, enabled: boolean) => {
    const inputs = child.getElementsByTagName('input');
    for (const input of inputs) {
        input.disabled = !enabled;
    }
};

/**
 * Search bar
 * @param props Props
 * @returns Component
 */
export function SearchBar(props: SearchBarProps) {
    // Destruct
    const { className, fields, onSubmit } = props;

    // Labels
    const labels = Labels.CommonPage;

    // Spacing
    const theme = useTheme();
    const gap = parseFloat(theme.spacing(1));

    // Menu index
    const [index, updateIndex] = React.useState<number>();

    // Drawer open / close
    const [open, updateOpen] = React.useState(false);

    // Forms
    const [forms] = React.useState<{
        form?: HTMLFormElement;
        moreForm?: HTMLFormElement;
        submitSeed?: number;
        refreshSeed?: number;
        lastMaxWidth?: number;
    }>({});

    // Watch container
    const { dimensions } = useDimensions(1);

    // Refresh bar layout
    const refreshBar = (resetButton: HTMLButtonElement) => {
        forms.refreshSeed = undefined;

        // First
        const [_, container, containerRect] = dimensions[0];
        if (container == null || containerRect == null) return;

        // Container width
        let maxWidth = containerRect.width;
        if (maxWidth === forms.lastMaxWidth) {
            return;
        }
        forms.lastMaxWidth = maxWidth;

        // More button
        const buttonMore = resetButton.previousElementSibling!;

        // Cached button width
        const cachedButtonWidth = container.getAttribute(cachedWidthName);
        if (cachedButtonWidth) {
            maxWidth -= Number.parseFloat(cachedButtonWidth);
        } else {
            // Reset button rect
            const resetButtonRect = resetButton.getBoundingClientRect();

            // More button rect
            const buttonMoreRect = buttonMore.getBoundingClientRect();

            // Total
            const totalButtonWidth =
                resetButtonRect.width + buttonMoreRect.width + 3 * gap;

            // Cache
            container.setAttribute(
                cachedWidthName,
                totalButtonWidth.toString()
            );

            maxWidth -= totalButtonWidth;
        }

        // Children
        const children = container.children;

        // Len
        const len = children.length;

        // Other elements
        const others = len - 2;
        let hasMore = false;
        let newIndex: number = others;
        for (let c: number = 0; c < others; c++) {
            const child = children[c];
            const cachedWidth = child.getAttribute(cachedWidthName);
            let childWidth: number;
            if (cachedWidth) {
                childWidth = Number.parseFloat(cachedWidth);
            } else {
                const childD = child.getBoundingClientRect();
                childWidth = childD.width + gap;
                child.setAttribute(cachedWidthName, childWidth.toString());
            }

            // No gap here, child width includes the gap
            if (childWidth <= maxWidth) {
                maxWidth -= childWidth;
                setChildState(child, true);
                setElementVisible(child, true);
            } else {
                setChildState(child, false);
                setElementVisible(child, false);

                if (!hasMore) {
                    // Make sure coming logic to the block
                    maxWidth = 0;

                    // Keep the current index
                    newIndex = c;

                    // Indicates more
                    hasMore = true;
                }
            }
        }

        // Show or hide more button
        setElementVisible(buttonMore, hasMore);

        // Update menu start index
        updateIndex(newIndex);
    };

    // Show or hide element
    const setElementVisible = (element: Element, visible: boolean) => {
        element.classList.remove(visible ? 'hiddenChild' : 'showChild');
        element.classList.add(visible ? 'showChild' : 'hiddenChild');
    };

    // Reset button ref
    const resetButtonRef = (instance: HTMLButtonElement) => {
        // Reset button
        const resetButton = instance;

        if (forms.refreshSeed != null) {
            clearTimeout(forms.refreshSeed);
        }
        forms.refreshSeed = window.setTimeout(refreshBar, 10, resetButton);
    };

    // More items creator
    const moreItems: React.ReactElement[] = [];
    if (index != null) {
        for (let i: number = index; i < fields.length; i++) {
            moreItems.push(
                <React.Fragment key={i}>{fields[i]}</React.Fragment>
            );
        }
    }

    // Handle main form
    const handleForm = (event: React.FormEvent<HTMLFormElement>) => {
        if (event.nativeEvent.cancelable && !event.nativeEvent.composed) return;

        if (forms.form == null) forms.form = event.currentTarget;

        handleSubmit();
    };

    // Handle more button click
    const handleMore = () => {
        updateOpen(!open);
    };

    // More form change
    const moreFormChange = (event: React.FormEvent<HTMLFormElement>) => {
        if (event.nativeEvent.cancelable && !event.nativeEvent.composed) return;

        if (forms.moreForm == null) forms.moreForm = event.currentTarget;

        handleSubmit();
    };

    // Reset
    const handleReset = () => {
        // Clear form values
        if (forms.form != null) resetForm(forms.form);
        if (forms.moreForm != null) resetForm(forms.moreForm);

        // Resubmit
        handleSubmitInstant(true);
    };

    // Submit
    const handleSubmit = () => {
        if (forms.submitSeed != null) {
            clearTimeout(forms.submitSeed);
        }

        // Delay the change
        forms.submitSeed = window.setTimeout(handleSubmitInstant, 480);
    };

    // Submit at once
    const handleSubmitInstant = (reset: boolean = false) => {
        // Reset timeout
        forms.submitSeed = undefined;

        // Prepare data
        const data = new FormData(forms.form);
        if (forms.moreForm != null) {
            DomUtils.mergeFormData(data, new FormData(forms.moreForm));
        }

        onSubmit(data, reset);
    };

    // First loading
    React.useEffect(() => {
        // Delayed way
        handleSubmit();
    }, []);

    // Layout
    return (
        <React.Fragment>
            <form
                id="SearchBarForm"
                className={className}
                onChange={handleForm}
                ref={(form) => {
                    if (form) forms.form = form;
                }}
            >
                <Stack
                    ref={dimensions[0][0]}
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                    spacing={1}
                    sx={{
                        '& > :not(style)': {
                            flexBasis: 'auto',
                            flexGrow: 0,
                            flexShrink: 0,
                            maxWidth: '180px',
                            position: 'fixed'
                        },
                        '& > .hiddenChild': {
                            display: 'none'
                        },
                        '& > .showChild': {
                            display: 'block',
                            position: 'static'
                        }
                    }}
                >
                    {fields.map((item, index) => (
                        <React.Fragment key={index}>{item}</React.Fragment>
                    ))}

                    <IconButton
                        aria-label="delete"
                        size="medium"
                        onClick={handleMore}
                    >
                        <MoreHorizIcon />
                    </IconButton>
                    <Button
                        variant="contained"
                        size="medium"
                        ref={resetButtonRef}
                        onClick={handleReset}
                        className="showChild"
                    >
                        {labels.reset}
                    </Button>
                </Stack>
            </form>
            {index != null && index < fields.length && (
                <Drawer
                    anchor="right"
                    sx={{ minWidth: '200px' }}
                    ModalProps={{
                        keepMounted: true // Better open performance on mobile.
                    }}
                    open={open}
                    onClose={() => updateOpen(false)}
                >
                    <form
                        onChange={moreFormChange}
                        ref={(form) => {
                            if (form) forms.moreForm = form;
                        }}
                    >
                        <Stack
                            direction="column"
                            alignItems="stretch"
                            spacing={2}
                            padding={2}
                        >
                            {moreItems}
                        </Stack>
                    </form>
                </Drawer>
            )}
        </React.Fragment>
    );
}
