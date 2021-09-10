import { Button, Grid } from '@mui/material';
import React, { FormEventHandler } from 'react';
import { Labels } from '../../app/Labels';
import { CommonPage } from './CommonPage';
import { CommonPageProps } from './CommonPageProps';

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
    const { children, onSubmit, paddings, ...rest } = props;

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
