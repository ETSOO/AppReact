/**
 * Refresh token request data
 */
export type RefreshTokenRQ = {
    /**
     * Device id
     */
    deviceId: string;

    /**
     * Login password
     */
    pwd?: string;

    /**
     * Service device id
     */
    serviceDeviceId?: string;

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
