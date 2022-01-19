import { IdLabelDto } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import { Autocomplete, AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';
import { Utils } from '../app/Utils';
import { AutocompleteExtendedProps } from './AutocompleteExtendedProps';
import { InputField } from './InputField';
import { SearchField } from './SearchField';

/**
 * Tiplist props
 */
export interface TiplistProps<T extends {}>
    extends Omit<AutocompleteExtendedProps<T>, 'open'> {
    /**
     * Load data callback
     */
    loadData: (
        keyword?: string,
        id?: DataTypes.IdType
    ) => PromiseLike<T[] | null | undefined>;
}

// Multiple states
interface States<T extends {}> {
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
export function Tiplist<T extends {} = IdLabelDto>(props: TiplistProps<T>) {
    // Destruct
    const {
        search = false,
        idField = 'id',
        idValue,
        inputAutoComplete = 'off',
        inputError,
        inputHelperText,
        inputMargin,
        inputOnChange,
        inputRequired,
        inputVariant,
        label,
        loadData,
        defaultValue,
        value,
        name,
        readOnly,
        onChange,
        openOnFocus = true,
        sx = { minWidth: '180px' },
        ...rest
    } = props;

    // Value input ref
    const inputRef = React.createRef<HTMLInputElement>();

    // Local value
    let localValue = value ?? defaultValue;
    if (localValue === undefined) localValue = null;

    // One time calculation for input's default value (uncontrolled)
    const localIdValue =
        idValue ?? (localValue && Reflect.get(localValue, idField));

    // Changable states
    const [states, stateUpdate] = React.useReducer(
        (currentState: States<T>, newState: Partial<States<T>>) => {
            return { ...currentState, ...newState };
        },
        {
            // Loading unknown
            open: false,
            options: [],
            value: null
        }
    );

    React.useEffect(() => {
        if (localValue != null) stateUpdate({ value: localValue });
    }, [localValue]);

    // State
    const [state] = React.useState<{
        loadDataSeed?: number;
        idLoaded?: boolean;
        idSet?: boolean;
    }>({});
    const isMounted = React.useRef(true);

    // Add readOnly
    const addReadOnly = (params: AutocompleteRenderInputParams) => {
        if (readOnly != null) {
            Object.assign(params, { readOnly });
        }

        // https://stackoverflow.com/questions/15738259/disabling-chrome-autofill
        // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html
        Object.assign(params.inputProps, { autoComplete: inputAutoComplete });

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
    const loadDataDirect = (keyword?: string, id?: DataTypes.IdType) => {
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
        if (!states.loading) stateUpdate({ loading: true });

        // Load list
        loadData(keyword, id).then((options) => {
            if (!isMounted.current) return;

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
            const newValue = DataTypes.getStringValue(value, idField) ?? '';
            if (newValue !== input.value) {
                // Different value, trigger change event
                Utils.triggerChange(input, newValue, false);
            }
        }
    };

    if (localIdValue != null && localIdValue !== '') {
        if (state.idLoaded) {
            // Set default
            if (!state.idSet && states.options.length == 1) {
                stateUpdate({ value: states.options[0] });
                state.idSet = true;
            }
        } else {
            // Load id data
            loadDataDirect(undefined, localIdValue);
            state.idLoaded = true;
        }
    }

    React.useEffect(() => {
        return () => {
            // Clear any seed
            if (state.loadDataSeed != null) {
                clearTimeout(state.loadDataSeed);
            }

            isMounted.current = false;
        };
    }, []);

    // Layout
    return (
        <div>
            <input
                ref={inputRef}
                data-reset="true"
                type="text"
                style={{ display: 'none' }}
                name={name}
                value={localIdValue ?? ''}
                readOnly
                onChange={inputOnChange}
            />
            {/* Previous input will reset first with "disableClearable = false", next input trigger change works */}
            <Autocomplete
                filterOptions={(options, _state) => options}
                value={states.value}
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
                        loadDataDirect();
                    }
                }}
                open={states.open}
                openOnFocus={openOnFocus}
                onOpen={() => {
                    // Should load
                    const loading = states.loading
                        ? true
                        : states.options.length === 0;

                    stateUpdate({ open: true, loading });

                    // If not loading
                    if (loading)
                        loadDataDirect(
                            undefined,
                            states.value == null
                                ? undefined
                                : Reflect.get(states.value, idField)
                        );
                }}
                onClose={() => {
                    stateUpdate({
                        open: false,
                        ...(!states.value && { options: [] })
                    });
                }}
                loading={states.loading}
                sx={sx}
                renderInput={(params) =>
                    search ? (
                        <SearchField
                            onChange={changeHandle}
                            {...params}
                            readOnly={readOnly}
                            label={label}
                            name={name + 'Input'}
                            margin={inputMargin}
                            variant={inputVariant}
                            required={inputRequired}
                            autoComplete={inputAutoComplete}
                            error={inputError}
                            helperText={inputHelperText}
                        />
                    ) : (
                        <InputField
                            onChange={changeHandle}
                            {...addReadOnly(params)}
                            label={label}
                            name={name + 'Input'}
                            margin={inputMargin}
                            variant={inputVariant}
                            required={inputRequired}
                            autoComplete={inputAutoComplete}
                            error={inputError}
                            helperText={inputHelperText}
                        />
                    )
                }
                isOptionEqualToValue={(option: any, value: any) =>
                    option[idField] === value[idField]
                }
                {...rest}
            />
        </div>
    );
}
