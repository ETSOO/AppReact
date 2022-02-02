import { Utils } from '@etsoo/shared';
import {
    Button,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Theme,
    Typography,
    useTheme
} from '@mui/material';
import React, { CSSProperties } from 'react';
import { globalApp, NotificationMessageType } from '..';
import { ListMoreDisplay, ListMoreDisplayProps } from './ListMoreDisplay';

/**
 * Audit line update data model
 */
export interface AuditLineUpdateData {
    oldData: Record<string, unknown>;
    newData: Record<string, unknown>;
}

/**
 * Audit line data model
 */
export interface AuditLine {
    id: number;
    creation: Date;
    user: string;
    action: string;
    changes?: AuditLineUpdateData;
}

/**
 * Audit display props
 */
export interface AuditDisplayProps
    extends Omit<ListMoreDisplayProps<AuditLine>, 'children'> {
    /**
     * Get list item style callback
     */
    getItemStyle?: (index: number, theme: Theme) => CSSProperties;

    /**
     * Item/line renderer
     */
    itemRenderer?: (data: AuditLine, index: number) => React.ReactNode;
}

// Get label
const getLabel = (key: string) => {
    if (typeof globalApp === 'undefined') return key;
    return globalApp.get(Utils.formatInitial(key)) ?? key;
};

// Format date
const formatDate = (date: Date) => {
    if (typeof globalApp === 'undefined') return date.toUTCString();
    return globalApp.formatDate(date, 'ds');
};

// Format value
const formatValue = (value: unknown) => {
    if (value == null) return '';
    if (value instanceof Date && typeof globalApp !== 'undefined')
        return globalApp.formatDate(value, 'ds');
    return `${value}`;
};

/**
 * Audit display
 * @param props Props
 * @returns Component
 */
export function AuditDisplay(props: AuditDisplayProps) {
    // Theme
    const theme = useTheme();

    // Label
    const dataComparisonLabel = getLabel('dataComparison');

    // Show data comparison
    const showDataComparison = (data: AuditLineUpdateData) => {
        if (typeof globalApp === 'undefined') return;

        const keys = new Set([
            ...Object.keys(data.oldData),
            ...Object.keys(data.newData)
        ]);

        const rows = Array.from(keys).map((field) => ({
            field,
            oldValue: data.oldData[field],
            newValue: data.newData[field]
        }));

        const inputs = (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>{getLabel('field')}</TableCell>
                        <TableCell align="right">
                            {getLabel('oldValue')}
                        </TableCell>
                        <TableCell align="right">
                            {getLabel('newValue')}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.field}>
                            <TableCell>{getLabel(row.field)}</TableCell>
                            <TableCell align="right">
                                {formatValue(row.oldValue)}
                            </TableCell>
                            <TableCell align="right">
                                {formatValue(row.newValue)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );

        globalApp.notifier.alert(
            [undefined, dataComparisonLabel],
            undefined,
            NotificationMessageType.Info,
            { fullScreen: globalApp.smDown, inputs }
        );
    };

    // Destruct
    const {
        getItemStyle = (index, theme) => ({
            padding: [theme.spacing(1.5), theme.spacing(1)].join(' '),
            background:
                index % 2 === 0
                    ? theme.palette.grey[100]
                    : theme.palette.grey[50]
        }),
        itemRenderer = (data) => {
            return (
                <React.Fragment>
                    {data.changes != null && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => showDataComparison(data.changes!)}
                            sx={{
                                marginLeft: theme.spacing(1),
                                marginTop: theme.spacing(-0.5),
                                float: 'right'
                            }}
                        >
                            {dataComparisonLabel}
                        </Button>
                    )}
                    <Typography>
                        {formatDate(data.creation) +
                            ', [' +
                            getLabel(data.action) +
                            '], ' +
                            data.user}
                    </Typography>
                </React.Fragment>
            );
        },
        headerTitle = (
            <React.Fragment>
                <Typography>{getLabel('audits')}</Typography>
                <Divider />
            </React.Fragment>
        ),
        ...rest
    } = props;

    // Layout
    return (
        <ListMoreDisplay headerTitle={headerTitle} {...rest}>
            {(data, index) => (
                <div key={data.id} style={getItemStyle(index, theme)}>
                    {itemRenderer(data, index)}
                </div>
            )}
        </ListMoreDisplay>
    );
}
