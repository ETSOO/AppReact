import { DataTypes } from '@etsoo/shared';
import { RouteComponentProps } from '@reach/router';
import { Props } from 'react-input-mask';

/**
 * Add / Edit page router props, include 'id' (/:id) or none when adding query parameter
 */
export type EditPageRouterProps = IdRouterProps & WildcardRouterProps;

/**
 * Get edit page id
 * @param props Route props
 * @param type Target data type
 * @returns Data
 */
export function getEditPageId<T extends DataTypes.BasicNames = 'number'>(
    props: EditPageRouterProps,
    type: T
): DataTypes.BasicConditional<T> | undefined {
    const id = props.id ?? props['*'];
    if (id == null || id === '') return undefined;
    return DataTypes.convertByType(id, type);
}

/**
 * Id router props, include 'id' (/:id) query parameter
 */
export type IdRouterProps = RouteComponentProps<{ id: string }>;

/**
 * Wildcard router props, (/*) query parameter
 */
export type WildcardRouterProps = RouteComponentProps<{ '*': string }>;

/**
 * Id state router props, include 'id' in location.state
 */
export type IdStateRouterProps<T extends DataTypes.IdType = number> =
    StateRouterProps<{ id: T }>;

/**
 * State router props, include data in location.state
 */
export type StateRouterProps<T extends Readonly<DataTypes.StringRecord>> =
    RouteComponentProps<{
        location: { state: T };
    }>;
