import { DataTypes } from '@etsoo/shared';
import { AutocompleteProps } from '@mui/material';

/**
 * Autocomplete extended props
 */
export interface AutocompleteExtendedProps<T extends Record<string, any>>
    extends Omit<
        AutocompleteProps<T, undefined, false, false>,
        'renderInput' | 'options'
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
     * If `dense` or `normal`, will adjust vertical spacing of this and contained components.
     * @default 'none'
     */
    inputMargin?: 'dense' | 'normal' | 'none';

    /**
     * If `true`, the label will indicate that the `input` is required.
     * @default false
     */
    inputRequired?: boolean;

    /**
     * The variant to use.
     * @default 'outlined'
     */
    inputVariant?: 'standard' | 'outlined' | 'filled';

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
