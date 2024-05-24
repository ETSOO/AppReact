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
export interface ICustomFieldReact<
    V,
    D extends CustomFieldData = CustomFieldData
> extends ICustomField<V, D, CustomFieldReactProps<V, D>, React.JSX.Element> {}

/**
 * React custom field props
 * React自定义字段属性
 */
export type CustomFieldReactProps<
    V,
    D extends CustomFieldData = CustomFieldData
> = CustomFieldProps<D, V> & {
    mref: React.Ref<CustomFieldRef<V>>;
};
