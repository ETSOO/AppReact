import { Button, Grid } from '@mui/material';
import React, { FormEventHandler } from 'react';
import { Labels } from '../../app/Labels';
import { MUGlobal } from '../MUGlobal';
import { CommonPage, CommonPageScrollContainer } from './CommonPage';
import { CommonPageProps } from './CommonPageProps';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Add / Edit page props
 */
export interface EditPageProps extends Omit<CommonPageProps, 'onSubmit'> {
    /**
     * Is editing
     */
    isEditing?: boolean;

    /**
     * On form submit
     */
    onSubmit?: FormEventHandler<HTMLFormElement>;

    /**
     * On delete callback
     */
    onDelete?: () => Promise<void> | void;
}

/**
 * Add / Edit page
 * @param props Props
 */
export function EditPage(props: EditPageProps) {
    // Destruct
    const {
        children,
        isEditing,
        onDelete,
        onSubmit,
        paddings = MUGlobal.pagePaddings,
        scrollContainer = CommonPageScrollContainer,
        ...rest
    } = props;

    // Labels
    const labels = Labels.CommonPage;

    return (
        <CommonPage
            paddings={paddings}
            scrollContainer={scrollContainer}
            {...rest}
        >
            <form onSubmit={onSubmit}>
                <Grid
                    container
                    justifyContent="left"
                    spacing={paddings}
                    paddingTop={1}
                >
                    {children}
                </Grid>
                <Grid
                    container
                    position="sticky"
                    display="flex"
                    gap={paddings}
                    sx={{
                        top: 'auto',
                        bottom: (theme) =>
                            MUGlobal.updateWithTheme(paddings, theme.spacing),
                        paddingTop: paddings
                    }}
                >
                    {isEditing && onDelete && (
                        <Button
                            color="primary"
                            variant="outlined"
                            onClick={() => onDelete()}
                            startIcon={<DeleteIcon color="warning" />}
                        >
                            {labels.delete}
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        type="submit"
                        startIcon={<SaveIcon />}
                        sx={{ flexGrow: 1 }}
                    >
                        {labels.save}
                    </Button>
                </Grid>
            </form>
        </CommonPage>
    );
}
