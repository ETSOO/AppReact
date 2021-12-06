/**
 * Refresh token request data
 */
export type RefreshTokenRQ = {
    /**
     * Login password
     */
    pwd?: string;

    /**
     * Service id
     */
    serviceId?: number;

    /**
     * Service Uid
     */
    serviceUid?: string;

    /**
     * Time zone
     */
    timezone?: string;
};
