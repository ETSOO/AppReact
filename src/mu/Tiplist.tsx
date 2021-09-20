import { DataTypes } from '@etsoo/shared';
import {
    Autocomplete,
    AutocompleteProps,
    AutocompleteRenderInputParams
} from '@mui/material';
import React from 'react';
import { Utils } from '../app/Utils';
import { InputField } from './InputField';
import { SearchField } from './SearchField';

/**
 * Tiplist props
 */
export interface TiplistProps<T extends Record<string, any>>
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
    idValue?: DataTypes.IdType;

    /**
     * Label of the field
     */
    label: string;

    /**
     * Load data callback
     */
    loadData: (
        keyword?: string,
        id?: DataTypes.IdType
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
interface States<T extends Record<string, any>> {
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
export function Tiplist<T extends Record<string, any>>(props: TiplistProps<T>) {
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
        readOnly,
        onChange,
        sx = { minWidth: '150px' },
        ...rest
    } = props;

    // Value input ref
    const inputRef = React.createRef<HTMLInputElement>();

    // Local value
    const localValue = value ?? defaultValue;
    const localIdValue =
        idValue ?? (localValue == null ? undefined : localValue[idField]);

    // Changable states
    const [states, stateUpdate] = React.useReducer(
        (currentState: States<T>, newState: Partial<States<T>>) => {
            return { ...currentState, ...newState };
        },
        {
            // Loading unknown
            open: false,
            options: [],
            value: localValue ?? null
        }
    );

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
            const newValue =
                value != null && idField in value ? `${value[idField]}` : '';
            if (newValue !== input.value) {
                // Different value, trigger change event
                Utils.triggerChange(input, newValue, false);
            }
        }
    };

    if (localIdValue != null) {
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
                defaultValue={localIdValue}
            />
            {/* Previous input will reset first, next input trigger change works */}
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
                                : states.value[idField]
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
                isOptionEqualToValue={(option: any, value: any) =>
                    option[idField] === value[idField]
                }
                {...rest}
            />
        </div>
    );
}
