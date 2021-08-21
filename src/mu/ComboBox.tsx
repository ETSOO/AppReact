import { DataTypes } from '@etsoo/shared';
import {
    Autocomplete,
    AutocompleteProps,
    AutocompleteRenderInputParams
} from '@material-ui/core';
import React from 'react';
import { Utils } from '../app/Utils';
import { InputField } from './InputField';
import { SearchField } from './SearchField';

/**
 * ComboBox props
 */
export interface ComboBoxProps<T extends Record<string, any>>
    extends Omit<AutocompleteProps<T, undefined, false, false>, 'renderInput'> {
    /**
     * Id field, default is id
     */
    idField?: string;

    /**
     * Label of the field
     */
    label: string;

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
 * ComboBox
 * @param props Props
 * @returns Component
 */
export function ComboBox<T extends Record<string, any>>(
    props: ComboBoxProps<T>
) {
    // Destruct
    const {
        search = false,
        idField = 'id',
        defaultValue,
        label,
        name,
        options,
        readOnly,
        onChange,
        value,
        sx = { minWidth: '120px' },
        ...rest
    } = props;

    // Value input ref
    const inputRef = React.createRef<HTMLInputElement>();

    // Local default value
    const localValue = defaultValue ?? value;
    const localDefaultValue =
        localValue == null
            ? undefined
            : DataTypes.isBaseType(localValue, true)
            ? options.find((o: any) => o[idField] === localValue)
            : localValue;

    // Current id value
    const idValue =
        localValue == null || localDefaultValue == null
            ? undefined
            : localDefaultValue[idField];

    // Add readOnly
    const addReadOnly = (params: AutocompleteRenderInputParams) => {
        if (readOnly != null) {
            Object.assign(params, { readOnly });

            if (readOnly) {
                if (params.inputProps == null) params.inputProps = {};
                Object.assign(params.inputProps, { 'data-reset': true });
            }
        }

        return params;
    };

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
                defaultValue={localDefaultValue}
                isOptionEqualToValue={(option: T, value: T) =>
                    option[idField] === value[idField]
                }
                onChange={(event, value, reason, details) => {
                    // Input value
                    const input = inputRef.current;
                    if (input) {
                        // Update value
                        const newValue =
                            value != null && idField in value
                                ? `${value[idField]}`
                                : '';

                        if (newValue !== input.value) {
                            // Different value, trigger change event
                            Utils.triggerChange(input, newValue, false);
                        }
                    }

                    // Custom
                    if (onChange != null)
                        onChange(event, value, reason, details);
                }}
                sx={sx}
                renderInput={(params) =>
                    search ? (
                        <SearchField {...addReadOnly(params)} label={label} />
                    ) : (
                        <InputField {...addReadOnly(params)} label={label} />
                    )
                }
                options={options}
                {...rest}
            />
        </div>
    );
}
