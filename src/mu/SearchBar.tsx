import { Button, Drawer, IconButton, Stack } from '@material-ui/core';
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

    // Menu index
    const [index, updateIndex] = React.useState<number>();

    // Drawer open / close
    const [open, updateOpen] = React.useState(false);

    // Forms
    const [forms] = React.useState<{
        form?: HTMLFormElement;
        moreForm?: HTMLFormElement;
        submitSeed?: number;
    }>({});

    // Watch container
    const { ref, dimensions } = useDimensions<HTMLElement>(true);

    // Reset button ref
    const resetButtonRef = (instance: HTMLButtonElement) => {
        // Reset button
        const resetButton = instance;

        // Check
        if (
            ref.current == null ||
            resetButton == null ||
            dimensions == null ||
            dimensions.width == 0
        ) {
            return;
        }

        // Ready to do calculation

        // More button
        const buttonMore = resetButton.previousElementSibling!;

        // Container
        const container = ref.current;

        // Container width
        let maxWidth = dimensions.width;

        // Cached button width
        const cachedButtonWidth = container.getAttribute(cachedWidthName);
        if (cachedButtonWidth) {
            maxWidth -= Number.parseFloat(cachedButtonWidth);
        } else {
            // Reset rect
            const resetButtonRect = resetButton.getBoundingClientRect();

            const buttonMoreRect = buttonMore.getBoundingClientRect();

            // Gap
            const gap = resetButtonRect.left - buttonMoreRect.right;

            // Total
            const totalButtonWidth =
                resetButtonRect.width + buttonMoreRect.width + 2 * gap;

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
                childWidth = childD.width + 8;
                child.setAttribute(cachedWidthName, childWidth.toString());
            }

            // No gap here, child width includes the gap
            if (childWidth <= maxWidth) {
                maxWidth -= childWidth;
                setChildState(child, true);
                child.classList.remove('hiddenChild');
            } else {
                setChildState(child, false);
                child.classList.add('hiddenChild');

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
        if (hasMore) buttonMore.classList.remove('hiddenChild');
        else buttonMore.classList.add('hiddenChild');

        // Update menu start index
        updateIndex(newIndex);
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
                    ref={ref}
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                    spacing={1}
                    sx={{
                        '& > :not(style)': {
                            flexBasis: 'auto',
                            flexGrow: 0,
                            flexShrink: 0,
                            maxWidth: '180px'
                        },
                        '& > .hiddenChild': {
                            display: 'none'
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
