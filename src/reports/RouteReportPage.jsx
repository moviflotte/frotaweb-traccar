import React, {
  Fragment, useCallback, useEffect, useRef, useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  IconButton, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import { utils, writeFileXLSX } from 'xlsx';
import ReportFilter from './components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import PositionValue from '../common/components/PositionValue';
import ColumnSelect from './components/ColumnSelect';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useCatch } from '../reactHelper';
import MapView from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositions from '../map/MapPositions';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import scheduleReport from './common/scheduleReport';
import MapScale from '../map/MapScale';
import { useRestriction } from '../common/util/permissions';
import CollectionActions from '../settings/components/CollectionActions';
import {nativePostMessage} from '../common/components/NativeInterface';
import { sessionActions } from '../store';
import { useDispatch } from 'react-redux';

const PrintHeader = ({from, to}) => {
  const devices = useSelector((state) => state.devices.items);
  const deviceId = useSelector((state) => state.devices.selectedId);
  const t = useTranslation();

  return <div style={{padding: 10}}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
    }}
    >
      <img
          src={`https://docs.frotaweb.com/${window.location.hostname}/logo_large.svg`}
          alt="Company Logo"
          style={{height: 60}}
          onLoad={async () => {
            requestAnimationFrame(() => requestAnimationFrame(window.print))
            nativePostMessage(`print|${t('reportRoute')}.pdf`)
          }}
      />
      <h1 style={{
        fontSize: 24,
        margin: 0,
      }}
      >
        {t('reportRoute')}
      </h1>
    </div>
    <div style={{
      marginTop: 10,
      fontSize: 14,
      color: '#555',
    }}
    >
      <div>
        <strong>
          {t('sharedDevice')}
          :
        </strong>
        {' '}
        {devices[deviceId]?.name || ''}
      </div>
      <div>
        <strong>
          {t('reportFrom')}
          :
        </strong>
        {' '}
        {new Date(from).toLocaleString()}
      </div>
      <div>
        <strong>
          {t('reportTo')}
          :
        </strong>
        {' '}
        {new Date(to).toLocaleString()}
      </div>
    </div>
  </div>
}

const RouteReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();

  const positionAttributes = usePositionAttributes(t);

  const devices = useSelector((state) => state.devices.items);
  const readonly = useRestriction('readonly');


  const [available, setAvailable] = useState([]);
  const [columns, setColumns] = useState(['fixTime', 'latitude', 'longitude', 'speed', 'address']);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [from, setFrom] = useState()
  const [to, setTo] = useState()
  const printing = useSelector((state) => state.session.printing);


  const selectedIcon = useRef();

  useEffect(() => {
    const handleAfterPrint = () => {
      dispatch(sessionActions.setPrinting(false));
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  useEffect(() => {
    if (selectedIcon.current) {
      selectedIcon.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [selectedIcon.current]);

  const onMapPointClick = useCallback((positionId) => {
    setSelectedItem(items.find((it) => it.id === positionId));
  }, [items, setSelectedItem]);

  const handleSubmit = useCatch(async ({ deviceIds, from, to, type }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId))
    if (type === 'mail') {
      const response = await fetch(`/api/reports/route/mail?${query.toString()}`);
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/route?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          const keySet = new Set();
          const keyList = [];
          data.forEach((position) => {
            Object.keys(position)
                .forEach((it) => keySet.add(it));
            Object.keys(position.attributes)
                .forEach((it) => keySet.add(it));
          });
          ['id', 'deviceId', 'outdated', 'network', 'attributes'].forEach((key) => keySet.delete(key));
          Object.keys(positionAttributes)
              .forEach((key) => {
                if (keySet.has(key)) {
                  keyList.push(key);
                  keySet.delete(key);
                }
              });
          setAvailable([...keyList, ...keySet].map((key) => [key, positionAttributes[key]?.name || key])
              .sort((a, b) => a[1].localeCompare(b[1])));
          setItems(data);
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    } if (type === 'export') {
      const table = document.querySelector('table');
      requestAnimationFrame(() => writeFileXLSX(utils.table_to_book(table), 'route.xlsx'));
    } else if (type === 'pdf') {
      setFrom(from)
      setTo(to)
      dispatch(sessionActions.setPrinting(true));
    }
  });

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'route';
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate('/reports/scheduled');
    }
  });

  return printing ? (<div>
    <PrintHeader from={from} to={to}></PrintHeader>
    <div>
      <Table>
      <TableHead>
        <TableRow>
          <TableCell>{t('sharedDevice')}</TableCell>
          {columns.map((key) => (<TableCell key={key}>{positionAttributes[key]?.name || key}</TableCell>))}
        </TableRow>
      </TableHead>
      <TableBody>
        {!loading ? items.slice(0, 8000)
            .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{devices[item.deviceId].name}</TableCell>
                  {columns.map((key) => (
                      <TableCell key={key}>
                        <PositionValue
                            position={item}
                            property={item.hasOwnProperty(key) ? key : null}
                            attribute={item.hasOwnProperty(key) ? null : key}
                        />
                      </TableCell>
                  ))}
                </TableRow>
            )) : (<TableShimmer columns={columns.length + 2} startAction />)}
      </TableBody>
    </Table>
    </div>
  </div>) : (
      <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportRoute']}>
        <div className={classes.container}>
          {selectedItem && (
              <div className={classes.containerMap}>
                <MapView>
                  <MapGeofence />
                  {[...new Set(items.map((it) => it.deviceId))].map((deviceId) => {
                    const positions = items.filter((position) => position.deviceId === deviceId);
                    return (
                        <Fragment key={deviceId}>
                          <MapRoutePath positions={positions} />
                          <MapRoutePoints positions={positions} onClick={onMapPointClick} />
                        </Fragment>
                    );
                  })}
                  <MapPositions positions={[selectedItem]} titleField="fixTime" />
                </MapView>
                <MapScale />
                <MapCamera positions={items} />
              </div>
          )}
          <div className={classes.containerMain}>
            <div className={classes.header}>
              <ReportFilter handleSubmit={handleSubmit} handleSchedule={handleSchedule} multiDevice loading={loading}>
                <ColumnSelect
                    columns={columns}
                    setColumns={setColumns}
                    columnsArray={available}
                    rawValues
                    disabled={!items.length}
                />
              </ReportFilter>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.columnAction} />
                  <TableCell>{t('sharedDevice')}</TableCell>
                  {columns.map((key) => (<TableCell key={key}>{positionAttributes[key]?.name || key}</TableCell>))}
                  <TableCell className={classes.columnAction} />
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading ? items.slice(0, 8000)
                    .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className={classes.columnAction} padding="none">
                            {selectedItem === item ? (
                                <IconButton size="small" onClick={() => setSelectedItem(null)} ref={selectedIcon}>
                                  <GpsFixedIcon fontSize="small" />
                                </IconButton>
                            ) : (
                                <IconButton size="small" onClick={() => setSelectedItem(item)}>
                                  <LocationSearchingIcon fontSize="small" />
                                </IconButton>
                            )}
                          </TableCell>
                          <TableCell>{devices[item.deviceId].name}</TableCell>
                          {columns.map((key) => (
                              <TableCell key={key}>
                                <PositionValue
                                    position={item}
                                    property={item.hasOwnProperty(key) ? key : null}
                                    attribute={item.hasOwnProperty(key) ? null : key}
                                />
                              </TableCell>
                          ))}
                          <TableCell className={classes.actionCellPadding}>
                            <CollectionActions
                                itemId={item.id}
                                endpoint="positions"
                                readonly={readonly}
                                setTimestamp={() => {
                                  // NOTE: Gets called when an item was removed
                                  setItems(items.filter((position) => position.id !== item.id));
                                }}
                            />
                          </TableCell>
                        </TableRow>
                    )) : (<TableShimmer columns={columns.length + 2} startAction />)}
              </TableBody>
            </Table>
          </div>
        </div>
      </PageLayout>
  );
};

export default RouteReportPage;
