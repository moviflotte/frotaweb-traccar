import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Menu,
  MenuItem,
  CardMedia,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '../../resources/images/data/lock.svg?react';
import LockOpenIcon from '../../resources/images/data/unlock.svg?react';
import PendingIcon from '@mui/icons-material/Pending';

import EditIcon from '../../resources/images/data/edit.svg?react';
import GeofenceIcon from '../../resources/images/data/geofence.svg?react';
import ReplayIcon from '../../resources/images/data/route.svg?react';
import SendIcon from '../../resources/images/data/send.svg?react';
import ShareIcon from '../../resources/images/data/share.svg?react';

import { useTranslation } from './LocalizationProvider';
import ConfirmDialog from './ConfirmDialog';
import PositionValue from './PositionValue';
import { useDeviceReadonly } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';

const useStyles = makeStyles((theme) => ({
  card: {
    pointerEvents: 'auto',
    width: theme.dimensions.popupMaxWidth,
    borderRadius: 15,
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  mediaButton: {
    color: theme.palette.primary.contrastText,
    mixBlendMode: 'difference',
  },
  header: {
    fontWeight: 'bold',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 0, 2),
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: 'auto',
  },
  icon: {
    width: '24px',
    height: '24px',
    fill: theme.palette.secondary.main,
  },
  success: {
    width: '24px',
    height: '24px',
    fill: theme.palette.success.main
  },
  error: {
    width: '24px',
    height: '24px',
    fill: theme.palette.error.main
  },
  table: {
    '& .MuiTableCell-sizeSmall': {
      padding: 0
    },
    '& .MuiTableCell-sizeSmall:first-child': {
      paddingRight: theme.spacing(0.5),
    },
  },
  cell: {
    borderBottom: 'none',
  },
  actions: {
    justifyContent: 'space-between',
    background: theme.palette.background.default,
  },
  popup: {},
  root: ({ desktopPadding }) => ({
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(3)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: 'translateX(-50%)',
  }),
}));

const StatusRow = ({ name, content }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell className={classes.cell}>
        <Typography variant="body2">{name}</Typography>
      </TableCell>
      <TableCell className={classes.cell}>
        <Typography variant="body2" color="textSecondary">{content}</Typography>
      </TableCell>
    </TableRow>
  );
};

const StatusCard = ({ deviceId, position, onClose, disableActions, desktopPadding = 0 }) => {
  const classes = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();

  const groups = useSelector((state) => state.groups.items);

  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);

  const deviceImage = device?.attributes?.deviceImage;

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference('positionItems', 'fixTime,address,speed,totalDistance');

  const navigationAppLink = useAttributePreference('navigationAppLink');
  const navigationAppTitle = useAttributePreference('navigationAppTitle');

  const [anchorEl, setAnchorEl] = useState(null);

  const [removing, setRemoving] = useState(false);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetch('/api/devices');
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
    setRemoving(false);
  });

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetch('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (response.ok) {
      const item = await response.json();
      const permissionResponse = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: position.deviceId, geofenceId: item.id }),
      });
      if (!permissionResponse.ok) {
        throw Error(await permissionResponse.text());
      }
      navigate(`/settings/geofence/${item.id}`);
    } else {
      throw Error(await response.text());
    }
  }, [navigate, position]);

  const [streetView, setStreetView] = useState(false)

  useEffect(() => {
    if (position) {
      fetch(`https://street-view.entrack-plataforma.workers.dev/?heading=${position.course}&location=${position.latitude},${position.longitude}&size=288x144&return_error_code=true`)
          .then(response => (setStreetView(response.ok)))
          .catch(() => setStreetView(false))
    }
  }, [position]);


  return (
      <>
        <div className={onClose ? classes.root : classes.popup}>
          {device && (
              <Draggable disabled={!onClose}
                  handle={`.${classes.media}, .${classes.header}`}
              >
                <Card elevation={3} className={classes.card}>
                  {(deviceImage || (position && streetView)) ? (<a target="_blank"
                                                                   href={position && `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}
                                                                   rel="noreferrer">
                    <CardMedia
                      className={classes.media}
                      image={deviceImage ? `/api/media/${device.uniqueId}/${deviceImage}`
                          : `https://street-view.entrack-plataforma.workers.dev/?heading=${position.course}&location=${position.latitude},${position.longitude}&size=288x144&return_error_code=true`}
                  >
                    <div className={classes.header}>
                      <div style={{textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)'}} variant="body2">
                        {device.name}<br/>{
                          Object.values(groups).find(g => g.id === device.groupId)
                          && Object.values(groups).find(g => g.id === device.groupId).name
                        }
                      </div>
                      {onClose && (<IconButton
                          size="small"
                          onClick={onClose}
                          onTouchStart={onClose}
                      >
                        <CloseIcon fontSize="small"/>
                      </IconButton>)}
                    </div>
                    </CardMedia></a>) : (
                      <div className={classes.header}>
                        <Typography variant="body2" color="textSecondary">
                          {device.name}
                        </Typography>
                        {onClose && (<IconButton
                            size="small"
                            onClick={onClose}
                            onTouchStart={onClose}
                        >
                          <CloseIcon fontSize="small"/>
                        </IconButton>)}
                      </div>
                  )}
                  {position && (
                      <CardContent className={classes.content} sx={{padding: 1}}>
                        <Table size="small" classes={{root: classes.table}}>
                          <TableBody>
                            {positionItems.split(',').filter((key) => position.hasOwnProperty(key) || position.attributes.hasOwnProperty(key)).map((key) => (
                                <StatusRow
                                    key={key}
                                    name={positionAttributes[key]?.name || key}
                                    content={(
                                        <PositionValue
                                            position={position}
                                            property={position.hasOwnProperty(key) ? key : null}
                                            attribute={position.hasOwnProperty(key) ? null : key}
                                        />
                                    )}
                                />
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                  )}
                  <CardActions classes={{ root: classes.actions }} sx={{padding: 0}} disableSpacing>
                    <IconButton
                        color="secondary"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        disabled={!position}
                    >
                      <PendingIcon />
                    </IconButton>
                    <Tooltip title={t('sharedCreateGeofence')} placement="bottom">
                      <IconButton onClick={handleGeofence}>
                        <GeofenceIcon className={classes.icon} />
                      </IconButton>
                    </Tooltip>
                    {!shareDisabled && !user.temporary && <Tooltip title= {t('deviceShare')} placement="bottom">
                      <IconButton onClick={() => navigate(`/settings/device/${deviceId}/share`)}>
                        <ShareIcon className={classes.icon} />
                      </IconButton>
                    </Tooltip>}
                    <IconButton
                        onClick={() => navigate('/replay')}
                        disabled={disableActions || !position}
                    >
                      <ReplayIcon className={classes.icon} />
                    </IconButton>
                    <Tooltip title= {t('commandTitle')} placement="bottom">
                      <IconButton
                          onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                          disabled={disableActions}
                      >
                        <SendIcon className={classes.icon} />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                        onClick={() => navigate(`/settings/device/${deviceId}`)}
                        disabled={disableActions || deviceReadonly}
                    >
                      <EditIcon className={classes.icon} />
                    </IconButton>
                    <IconButton
                        onClick={() => setRemoving(true)}
                        disabled={disableActions || deviceReadonly}
                    >
                      {position && position.attributes.blocked ?
                        <LockIcon className={classes.error}  /> :
                        <LockOpenIcon className={classes.success}  />
                      }
                    </IconButton>
                  </CardActions>
                </Card>
              </Draggable>
          )}
        </div>
        {position && (
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => navigate(`/position/${position.id}`)}><Typography color="secondary">{t('sharedShowDetails')}</Typography></MenuItem>
              <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}>{t('linkGoogleMaps')}</MenuItem>
              <MenuItem component="a" target="_blank" href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}>{t('linkAppleMaps')}</MenuItem>
              <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}>{t('linkStreetView')}</MenuItem>
              {navigationAppTitle && <MenuItem component="a" target="_blank" href={navigationAppLink.replace('{latitude}', position.latitude).replace('{longitude}', position.longitude)}>{navigationAppTitle}</MenuItem>}
            </Menu>
        )}
        <ConfirmDialog
            open={removing}
            endpoint="devices"
            itemId={deviceId}
            blocked={position && position.attributes.blocked}
            onResult={(removed) => handleRemove(removed)}
        />
      </>
  );
};

export default StatusCard;
