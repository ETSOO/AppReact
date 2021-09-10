import { DataTypes } from '@etsoo/shared';
import { Button, Grid } from '@mui/material';
import { RouteComponentProps } from '@reach/router';
import React, { FormEventHandler } from 'react';
import { Labels } from '../../app/Labels';
import { MUGlobal } from '../MUGlobal';
import { CommonPage } from './CommonPage';
import { CommonPageProps } from './CommonPageProps';

/**
 * Edit page router props, include 'id' (/:id) query parameter
 */
export type EditPageRouterProps<T extends DataTypes.IdType = number> =
    RouteComponentProps<{ id: T }>;

/**
 * Edit page props
 */
export interface EditPageProps extends Omit<CommonPageProps, 'onSubmit'> {
    /**
     * On form submit
     */
    onSubmit?: FormEventHandler<HTMLFormElement>;
}

/**
 * Edit page
 * @param props Props
 */
export function EditPage(props: EditPageProps) {
    // Destruct
    const {
        children,
        onSubmit,
        paddings = MUGlobal.pagePaddings,
        ...rest
    } = props;

    // Labels
    const labels = Labels.CommonPage;

    return (
        <CommonPage paddings={paddings} {...rest}>
            <form onSubmit={onSubmit}>
                <Grid
                    container
                    justifyContent="left"
                    spacing={paddings}
                    paddingTop={paddings}
                >
                    {children}
                </Grid>
                <Grid container paddingTop={paddings} paddingBottom={paddings}>
                    <Button variant="contained" type="submit" fullWidth>
                        {labels.save}
                    </Button>
                </Grid>
            </form>
        </CommonPage>
    );
}
