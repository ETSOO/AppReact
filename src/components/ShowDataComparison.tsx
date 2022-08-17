import { NotificationMessageType } from '@etsoo/notificationbase';
import { Utils } from '@etsoo/shared';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';
import React from 'react';
import { globalApp } from '../app/ReactApp';

/**
 * Audit line update data model
 */
export interface AuditLineUpdateData {
    oldData: Record<string, unknown>;
    newData: Record<string, unknown>;
}

// Format value
const formatValue = (value: unknown) => {
    if (value == null) return '';
    if (value instanceof Date && typeof globalApp !== 'undefined')
        return globalApp.formatDate(value, 'ds');
    return `${value}`;
};

/**
 * Show data comparison
 * @param data Data
 * @param modelTitle Model window title
 * @param getLabel Get label callback
 */
export const ShowDataComparison = (
    data: AuditLineUpdateData,
    modelTitle?: string,
    getLabel?: (field: string) => string
) => {
    if (typeof globalApp === 'undefined') return;

    modelTitle ??= globalApp.get<string>('dataComparison');
    getLabel ??= (key) => {
        return globalApp.get(Utils.formatInitial(key)) ?? key;
    };

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
                    <TableCell align="right">{getLabel('oldValue')}</TableCell>
                    <TableCell align="right">{getLabel('newValue')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.field}>
                        <TableCell>{getLabel!(row.field)}</TableCell>
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
        [undefined, modelTitle],
        undefined,
        NotificationMessageType.Info,
        { fullScreen: globalApp.smDown, inputs }
    );
};
