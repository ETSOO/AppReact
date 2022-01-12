import { DataTypes } from '@etsoo/shared';
import React from 'react';
import { MUGlobal } from '../MUGlobal';
import { ResponsibleContainer } from '../ResponsibleContainer';
import { CommonPage } from './CommonPage';
import { ResponsePageProps } from './ResponsivePageProps';

/**
 * Fixed height list page
 * @param props Props
 * @returns Component
 */
export function ResponsivePage<
    T extends {},
    F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate
>(props: ResponsePageProps<T, F>) {
    // Destruct
    const { pageProps = {}, ...rest } = props;

    pageProps.paddings ??= MUGlobal.pagePaddings;
    const { paddings, ...pageRest } = pageProps;

    const halfPadding = MUGlobal.half(paddings);

    // Layout
    return (
        <CommonPage {...pageRest} paddings={{}}>
            <ResponsibleContainer<T, F>
                paddings={paddings}
                listBoxSx={(dataGrid, height) => {
                    if (dataGrid) {
                        return {
                            padding: paddings
                        };
                    } else {
                        return {
                            height,
                            paddingTop: halfPadding,
                            paddingBottom: halfPadding
                        };
                    }
                }}
                {...rest}
            />
        </CommonPage>
    );
}
