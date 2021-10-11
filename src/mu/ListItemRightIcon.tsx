import { ListItemIcon, styled } from '@mui/material';

/**
 * List item right icon component
 */
export const ListItemRightIcon = styled(ListItemIcon)(({ theme }) => ({
    '& .MuiListItemIcon-root': {
        minWidth: '20px',
        marginLeft: theme.spacing(2)
    }
}));
