import {
    Autocomplete,
    AutocompleteProps,
    AutocompleteRenderInputParams
} from '@material-ui/core';
import React from 'react';
import { Labels } from '../app/Labels';
import { Utils } from '../app/Utils';
import { InputField } from './InputField';
import { SearchField } from './SearchField';

/**
 * Tiplist props
 */
export interface TiplistProps<T>
    extends Omit<
        AutocompleteProps<T, undefined, false, false>,
        'renderInput' | 'options' | 'open'
    > {
    /**
     * Id field, default is id
     */
    idField?: string;

    /**
     * Id value
     */
    idValue?: string | number;

    /**
     * Label of the field
     */
    label: string;

    /**
     * Load data callback
     */
    loadData: (
        keyword?: string,
        id?: string
    ) => PromiseLike<T[] | null | undefined>;

    /**
     * Name of the field
     */
    name: string;

    /**
     * Is the field read only?
     */
    readOnly?: boolean;

    /**
     * Is search field?
     */
    search?: boolean;
}

// Multiple states
interface States<T> {
    open: boolean;
    options: T[];
    value?: T | null;
    loading?: boolean;
}

/**
 * Tiplist
 * @param props Props
 * @returns Component
 */
export function Tiplist<T = any>(props: TiplistProps<T>) {
    // Labels
    const labels = Labels.AutoComplete;

    // Destruct
    const {
        search = false,
        idField = 'id',
        idValue,
        label,
        loadData,
        defaultValue,
        value,
        name,
        clearText = labels.clear,
        closeText = labels.close,
        loadingText = labels.loading,
        noOptionsText = labels.noOptions,
        getLimitTagsText = (more: number) =>
            labels.moreTag.replace('{0}', more.toString()),
        openText = labels.open,
        readOnly,
        onChange,
        sx = { minWidth: '150px' },
        ...rest
    } = props;

    // Value input ref
    const inputRef = React.createRef<HTMLInputElement>();

    // Changable states
    const [states, stateUpdate] = React.useReducer(
        (state: States<T>, newState: Partial<States<T>>) => {
            return { ...state, ...newState };
        },
        {
            // Loading unknown
            open: false,
            options: [],
            value: value || defaultValue || null
        }
    );

    // State
    const [state] = React.useState<{
        loadDataSeed?: number;
        idLoaded?: boolean;
        idSet?: boolean;
    }>({});

    // Add readOnly
    const addReadOnly = (params: AutocompleteRenderInputParams) => {
        if (readOnly != null) {
            Object.assign(params, { readOnly });
        }

        return params;
    };

    // Change handler
    const changeHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Stop processing with auto trigger event
        if (event.nativeEvent.cancelable && !event.nativeEvent.composed) {
            stateUpdate({ options: [] });
            return;
        }

        // Stop bubble
        event.stopPropagation();

        // Clear any seed
        if (state.loadDataSeed != null) {
            clearTimeout(state.loadDataSeed);
        }

        // Delay 480 for loading data
        state.loadDataSeed = window.setTimeout(
            loadDataDirect,
            480,
            event.currentTarget.value
        );
    };

    // Directly load data
    const loadDataDirect = (keyword?: string, id?: string) => {
        // Reset seed value
        state.loadDataSeed = undefined;

        // Reset options
        // setOptions([]);

        if (id == null) {
            // Reset real value
            const input = inputRef.current;

            if (input && input.value !== '') {
                // Different value, trigger change event
                Utils.triggerChange(input, '', false);
            }

            if (states.options.length > 0) {
                // Reset options
                stateUpdate({ options: [] });
            }
        }

        // Loading indicator
        stateUpdate({ loading: true });

        // Load list
        loadData(keyword, id).then((options) => {
            // Indicates loading completed
            stateUpdate({
                loading: false,
                ...(options != null && { options })
            });
        });
    };

    const setInputValue = (value: T | null) => {
        stateUpdate({ value });

        // Input value
        const input = inputRef.current;
        if (input) {
            // Update value
            const newValue =
                value != null && idField in value
                    ? `${(value as any)[idField]}`
                    : '';
            if (newValue !== input.value) {
                // Different value, trigger change event
                Utils.triggerChange(input, newValue, false);
            }
        }
    };

    if (idValue != null) {
        if (state.idLoaded) {
            // Set default
            if (!state.idSet && states.options.length == 1) {
                stateUpdate({ value: states.options[0] });
                state.idSet = true;
            }
        } else {
            // Load id data
            loadDataDirect(undefined, idValue.toString());
            state.idLoaded = true;
        }
    }

    // Layout
    return (
        <div>
            <input
                ref={inputRef}
                data-reset="true"
                type="text"
                style={{ display: 'none' }}
                name={name}
                defaultValue={idValue}
            />
            {/* Previous input will reset first, next input trigger change works */}
            <Autocomplete
                clearText={clearText}
                closeText={closeText}
                loadingText={loadingText}
                noOptionsText={noOptionsText}
                getLimitTagsText={getLimitTagsText}
                filterOptions={(options, _state) => options}
                value={states.value}
                openText={openText}
                options={states.options}
                onChange={(event, value, reason, details) => {
                    // Set value
                    setInputValue(value);

                    // Custom
                    if (onChange != null)
                        onChange(event, value, reason, details);

                    // For clear case
                    if (reason === 'clear') {
                        stateUpdate({ options: [] });
                    }
                }}
                open={states.open}
                onOpen={() => {
                    // Should load
                    const loading = states.loading
                        ? true
                        : states.options.length === 0;

                    stateUpdate({ open: true, loading });

                    // If not loading
                    if (loading) loadDataDirect();
                }}
                onClose={() => {
                    stateUpdate({ open: false });
                }}
                loading={states.loading}
                sx={sx}
                renderInput={(params) =>
                    search ? (
                        <SearchField
                            onChange={changeHandle}
                            readOnly={readOnly}
                            {...params}
                            label={label}
                        />
                    ) : (
                        <InputField
                            onChange={changeHandle}
                            {...addReadOnly(params)}
                            label={label}
                        />
                    )
                }
                {...rest}
            />
        </div>
    );
}
