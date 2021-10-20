import { IdLabelDto } from '@etsoo/appscript';
import { Autocomplete, AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';
import { Utils } from '../app/Utils';
import { AutocompleteExtendedProps } from './AutocompleteExtendedProps';
import { InputField } from './InputField';
import { SearchField } from './SearchField';

/**
 * ComboBox props
 */
export interface ComboBoxProps<T extends {}>
    extends AutocompleteExtendedProps<T> {
    /**
     * Label field
     */
    labelField?: string;

    /**
     * Load data callback
     */
    loadData?: () => PromiseLike<T[] | null | undefined>;

    /**
     * On load data handler
     */
    onLoadData?: (options: T[]) => void;

    /**
     * Array of options.
     */
    options?: ReadonlyArray<T>;
}

/**
 * ComboBox
 * @param props Props
 * @returns Component
 */
export function ComboBox<T extends {} = IdLabelDto>(props: ComboBoxProps<T>) {
    // Destruct
    const {
        search = false,
        idField = 'id',
        idValue,
        inputAutoComplete = 'new-region',
        inputError,
        inputHelperText,
        inputMargin,
        inputOnChange,
        inputRequired,
        inputVariant,
        defaultValue,
        label,
        labelField = 'label',
        loadData,
        onLoadData,
        name,
        options = [],
        readOnly = true,
        onChange,
        value,
        getOptionLabel = (option: T) => String(Reflect.get(option, labelField)),
        sx = { minWidth: '150px' },
        ...rest
    } = props;

    // Value input ref
    const inputRef = React.createRef<HTMLInputElement>();

    // Options state
    const [localOptions, setOptions] = React.useState(options);
    const isMounted = React.useRef(true);

    // Local default value
    const localValue =
        idValue != null
            ? localOptions.find((o) => Reflect.get(o, idField) === idValue)
            : defaultValue ?? value;

    // Current id value
    // One time calculation for input's default value (uncontrolled)
    const localIdValue = localValue && Reflect.get(localValue, idField);

    // State
    const [stateValue, setStateValue] = React.useState(localValue);

    // Add readOnly
    const addReadOnly = (params: AutocompleteRenderInputParams) => {
        if (readOnly != null) {
            Object.assign(params, { readOnly });

            if (readOnly) {
                Object.assign(params.inputProps, { 'data-reset': true });
            }
        }

        // https://stackoverflow.com/questions/15738259/disabling-chrome-autofill
        // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html
        Object.assign(params.inputProps, { autoComplete: inputAutoComplete });

        return params;
    };

    const setInputValue = (value: T | null) => {
        // Set state
        setStateValue(value);

        // Input value
        const input = inputRef.current;
        if (input) {
            // Update value
            const newValue =
                value != null && idField in value
                    ? `${Reflect.get(value, idField)}`
                    : '';

            if (newValue !== input.value) {
                // Different value, trigger change event
                Utils.triggerChange(input, newValue, false);
            }
        }
    };

    React.useEffect(() => {
        if (loadData) {
            loadData().then((result) => {
                if (result == null || !isMounted.current) return;
                if (onLoadData) onLoadData(result);
                setOptions(result);
            });
        }

        return () => {
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
                onChange={inputOnChange}
            />
            {/* Previous input will reset first with "disableClearable = false", next input trigger change works */}
            <Autocomplete
                value={stateValue}
                getOptionLabel={getOptionLabel}
                isOptionEqualToValue={(option: T, value: T) =>
                    Reflect.get(option, idField) === Reflect.get(value, idField)
                }
                onChange={(event, value, reason, details) => {
                    // Set value
                    setInputValue(value);

                    // Custom
                    if (onChange != null)
                        onChange(event, value, reason, details);
                }}
                sx={sx}
                renderInput={(params) =>
                    search ? (
                        <SearchField
                            {...addReadOnly(params)}
                            label={label}
                            name={name + 'Input'}
                            margin={inputMargin}
                            variant={inputVariant}
                            required={inputRequired}
                            error={inputError}
                            helperText={inputHelperText}
                        />
                    ) : (
                        <InputField
                            {...addReadOnly(params)}
                            label={label}
                            name={name + 'Input'}
                            margin={inputMargin}
                            variant={inputVariant}
                            required={inputRequired}
                            error={inputError}
                            helperText={inputHelperText}
                        />
                    )
                }
                options={localOptions}
                {...rest}
            />
        </div>
    );
}
