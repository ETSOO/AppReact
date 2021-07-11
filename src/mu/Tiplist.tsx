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
    loadData: (keyword?: string, id?: string) => T[] | PromiseLike<T[]>;

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

    // Value
    const [valueLocal, updateValue] = React.useState(
        value || defaultValue || null
    );

    // Value input ref
    const inputRef = React.createRef<HTMLInputElement>();

    // Open state
    const [open, setOpen] = React.useState(false);

    // State
    const [state] = React.useState<{
        loadDataSeed?: number;
        idLoaded?: boolean;
        idSet?: boolean;
    }>({});

    // Options
    const [options, setOptions] = React.useState<T[]>([]);

    // Current loading or not
    const loading = open && options.length === 0;

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
            setOptions([]);
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

            if (options.length > 0) {
                // Reset options
                setOptions([]);
            }
        }

        // Load list
        const result = loadData(keyword, id);
        if (Array.isArray(result)) {
            setOptions(result);
        } else {
            result.then((options) => {
                setOptions(options);
            });
        }
    };

    const setInputValue = (value: T | null) => {
        updateValue(value);

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
            if (!state.idSet && options.length == 1) {
                updateValue(options[0]);
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
                value={valueLocal}
                openText={openText}
                options={options}
                onChange={(event, value, reason, details) => {
                    // Set value
                    setInputValue(value);

                    // Custom
                    if (onChange != null)
                        onChange(event, value, reason, details);

                    // For clear case
                    if (reason === 'clear') {
                        setOptions([]);
                    }
                }}
                open={open}
                onOpen={() => {
                    setOpen(true);
                    if (options.length === 0) loadDataDirect();
                }}
                onClose={() => {
                    setOpen(false);
                }}
                loading={loading}
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
