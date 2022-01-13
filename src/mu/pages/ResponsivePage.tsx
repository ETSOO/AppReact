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
    const { paddings, fabColumnDirection, ...pageRest } = pageProps;

    const half = MUGlobal.half(paddings);

    // State
    const [scrollContainer, setScrollContainer] = React.useState<HTMLElement>();
    const [direction, setDirection] = React.useState(fabColumnDirection);

    // Layout
    return (
        <CommonPage
            {...pageRest}
            paddings={{}}
            scrollContainer={scrollContainer}
            fabColumnDirection={direction}
        >
            <ResponsibleContainer<T, F>
                paddings={paddings}
                containerBoxSx={(dataGrid) => {
                    // .SearchBox keep the same to avoid flick when switching between DataGrid and List
                    return {
                        '& .SearchBox': {
                            marginLeft: paddings,
                            marginTop: paddings,
                            marginRight: paddings,
                            marginBottom: half
                        },
                        '& .ListBox': {
                            marginBottom: paddings
                        },
                        '& .DataGridBox': {
                            marginLeft: paddings,
                            marginRight: paddings,
                            marginBottom: paddings
                        }
                    };
                }}
                elementReady={(element, isDataGrid) => {
                    setDirection(!isDataGrid);
                    setScrollContainer(element);
                }}
                {...rest}
            />
        </CommonPage>
    );
}
