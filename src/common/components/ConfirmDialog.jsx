import React from 'react';
import Button from '@mui/material/Button';
import { Snackbar } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useTranslation } from './LocalizationProvider';
import { useCatch } from '../../reactHelper';
import { snackBarDurationLongMs } from '../util/duration';

const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.down('md')]: {
            bottom: `calc(${theme.dimensions.bottomBarHeight}px + ${theme.spacing(1)})`,
        },
    },
    button: {
        height: 'auto',
        marginTop: 0,
        marginBottom: 0,
    },
}));

const ConfirmDialog = ({
                           open, endpoint, itemId, onResult, blocked
                       }) => {
    const classes = useStyles();
    const t = useTranslation();

    const handleRemove = useCatch(async () => {
        const response = await fetch('/api/commands/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deviceId: itemId,
                type: 'engineStop'
            }),
        });
        if (response.ok) {
            onResult(true);
        } else {
            throw Error(await response.text());
        }
    });

    return (
        <Snackbar
            className={classes.root}
            open={open}
            autoHideDuration={snackBarDurationLongMs}
            onClose={() => onResult(false)}
            message={t(blocked?'confirmUnblockCommand':'confirmBlockCommand')}
            action={(
                <Button size="small" className={classes.button} color="error" onClick={handleRemove}>
                    {blocked ? 'Desbloquear':'Bloquear'}
                </Button>
            )}
        />
    );
};

export default ConfirmDialog;
