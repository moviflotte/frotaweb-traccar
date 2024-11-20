import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableRow, TableCell, TableHead, TableBody, Button, TableFooter, FormControlLabel, Switch, TableSortLabel,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import { formatTime } from '../common/util/formatter';
import { useDeviceReadonly, useManager } from '../common/util/permissions';
import useSettingsStyles from './common/useSettingsStyles';
import DeviceUsersValue from './components/DeviceUsersValue';
import usePersistedState from '../common/util/usePersistedState';

const DevicesPage = () => {
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const groups = useSelector((state) => state.groups.items);

  const manager = useManager();
  const deviceReadonly = useDeviceReadonly();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAll, setShowAll] = usePersistedState('showAllDevices', false);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState('asc');
  const [orderBy, setOrderBy] = useState('groupParent');

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ all: showAll });
      const response = await fetch(`/api/devices?${query.toString()}`);
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp, showAll]);

  const handleExport = () => {
    window.location.assign('/api/reports/devices/xlsx');
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (deviceId) => navigate(`/settings/device/${deviceId}/connections`),
  };

  const toggleSort = (headCell) => {
    setOrderBy(headCell);
    setDirection(direction === 'asc' ? 'desc' : 'asc');
  };

  const sort = (a, b) => {
    const deviceFields = {
      sharedName: 'name',
      deviceIdentifier: 'uniqueId',
      sharedPhone: 'phone',
      deviceModel: 'model',
      deviceContact: 'contact',
      userExpirationTime: 'expiration',
    };

    const aValue = orderBy === 'groupParent' ? groups[a.groupId]?.name || '' : a[deviceFields[orderBy]];
    const bValue = orderBy === 'groupParent' ? groups[b.groupId]?.name || '' : b[deviceFields[orderBy]];

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  };

  const headCells = [
    'sharedName', 'deviceIdentifier', 'groupParent', 'sharedPhone', 'deviceModel', 'deviceContact', 'userExpirationTime',
  ];
  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceTitle']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            {headCells.map((headCell) => (
              <TableCell>
                <TableSortLabel direction={direction} onClick={() => toggleSort(headCell)}>
                  {t(headCell)}
                </TableSortLabel>
              </TableCell>
            ))}
            {manager && <TableCell>{t('settingsUsers')}</TableCell>}
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? items.filter(filterByKeyword(searchKeyword))
            .sort(sort)
            .map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.uniqueId}</TableCell>
                <TableCell>{item.groupId ? groups[item.groupId]?.name : null}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.model}</TableCell>
                <TableCell>{item.contact}</TableCell>
                <TableCell>{formatTime(item.expirationTime, 'date')}</TableCell>
                {manager && <TableCell><DeviceUsersValue deviceId={item.id} /></TableCell>}
                <TableCell className={classes.columnAction} padding="none">
                  <CollectionActions
                    itemId={item.id}
                    editPath="/settings/device"
                    endpoint="devices"
                    setTimestamp={setTimestamp}
                    customActions={[actionConnections]}
                    readonly={deviceReadonly}
                  />
                </TableCell>
              </TableRow>
            )) : (<TableShimmer columns={manager ? 8 : 7} endAction />)}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>
              <Button onClick={handleExport} variant="text">{t('reportExport')}</Button>
            </TableCell>
            <TableCell colSpan={manager ? 8 : 7} align="right">
              <FormControlLabel
                control={(
                  <Switch
                    checked={showAll}
                    onChange={(e) => setShowAll(e.target.checked)}
                    size="small"
                  />
                )}
                label={t('notificationAlways')}
                labelPlacement="start"
                disabled={!manager}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <CollectionFab editPath="/settings/device" />
    </PageLayout>
  );
};

export default DevicesPage;
