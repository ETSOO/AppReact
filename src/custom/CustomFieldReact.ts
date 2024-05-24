import {
    CustomFieldData,
    CustomFieldProps,
    CustomFieldRef,
    ICustomField
} from '@etsoo/appscript';

/**
 * React custom field interface
 * React自定义字段接口
 */
export interface ICustomFieldReact<D extends CustomFieldData = CustomFieldData>
    extends ICustomField<D, React.JSX.Element> {}

/**
 * React custom field props
 * React自定义字段属性
 */
export type CustomFieldReactProps<D extends CustomFieldData = CustomFieldData> =
    CustomFieldProps<D> & {
        mref: React.Ref<CustomFieldRef>;
    };
