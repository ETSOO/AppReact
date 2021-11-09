import { IAppSettings, IUser } from '@etsoo/appscript';
import { NotificationRenderProps } from '@etsoo/notificationbase';
import React from 'react';
import { ProgressCount } from '../mu/ProgressCount';
import { CultureState } from '../states/CultureState';
import { IPageData } from '../states/PageState';
import { ReactApp } from './ReactApp';

/**
 * Core Service App
 */
export class ServiceApp<
    S extends IAppSettings,
    U extends IUser,
    P extends IPageData
> extends ReactApp<S, U, P> {
    private static _notifierProvider: React.FunctionComponent<NotificationRenderProps>;

    /**
     * Get notifier provider
     */
    static get notifierProvider() {
        return ServiceApp._notifierProvider;
    }

    /**
     * Set notifier provider
     */
    protected static set notifierProvider(value) {
        ServiceApp._notifierProvider = value;
    }

    private static _cultureState: CultureState;

    /**
     * Get culture state
     */
    static get cultureState() {
        return ServiceApp._cultureState;
    }

    /**
     * Set culture state
     */
    protected static set cultureState(value) {
        ServiceApp._cultureState = value;
    }

    /**
     * Is screen size down 'sm'
     */
    smDown?: boolean;

    /**
     * Is screen size up 'md'
     */
    mdUp?: boolean;

    /**
     * Fresh countdown UI
     * @param callback Callback
     */
    freshCountdownUI(callback?: () => PromiseLike<unknown>) {
        // Labels
        const labels = this.getLabels('cancel', 'tokenExpiry');

        // Progress
        const progress = React.createElement(ProgressCount, {
            seconds: 30,
            valueUnit: 's',
            onComplete: () => {
                // Stop the progress
                return false;
            }
        });

        // Popup
        this.notifier.alert(
            labels.tokenExpiry,
            async () => {
                if (callback) await callback();
                else await this.tryLogin();
            },
            {
                okLabel: labels.cancel,
                primaryButton: { fullWidth: true, autoFocus: false },
                inputs: progress
            }
        );
    }
}
