/**
 * Refresh token request data
 */
export type RefreshTokenRQ = {
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
