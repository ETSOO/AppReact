import { DataTypes } from '@etsoo/shared';
import { RouteComponentProps } from '@reach/router';

/**
 * Add / Edit page router props, include 'id' (/:id) or none when adding query parameter
 */
export type EditPageRouterProps<T extends DataTypes.IdType = number> =
    IdRouterProps<T> & WildcardRouterProps<T>;

/**
 * Id router props, include 'id' (/:id) query parameter
 */
export type IdRouterProps<T extends DataTypes.IdType = number> =
    RouteComponentProps<{ id: T }>;

/**
 * Wildcard router props, (/*) query parameter
 */
export type WildcardRouterProps<T extends DataTypes.Basic = string> =
    RouteComponentProps<{ '*': T }>;

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
