import { DataTypes } from '@etsoo/shared';
import { RouteComponentProps } from '@reach/router';

/**
 * Id router props, include 'id' (/:id) query parameter
 */
export type IdRouterProps<T extends DataTypes.IdType = number> =
    RouteComponentProps<{ id: T }>;

/**
 * Id state router props, include 'id' in location.state
 */
export type IdStateRouterProps<T extends DataTypes.IdType = number> =
    StateRouterProps<{ id: T }>;

/**
 * State router props, include data in location.state
 */
export type StateRouterProps<T extends Readonly<Record<string, any>>> =
    RouteComponentProps<{
        location: { state: T };
    }>;
