import { grey } from '@mui/material/colors';
import createPalette from '@mui/material/styles/createPalette';
import { loadImage, prepareIcon } from './mapUtil';

import directionSvg from '../../resources/images/direction.svg';
import backgroundSvg from '../../resources/images/background.svg';
import animalSvg from '../../resources/images/icon/animal.svg';
import bicycleSvg from '../../resources/images/icon/bicycle.svg';
import boatSvg from '../../resources/images/icon/boat.svg';
import busSvg from '../../resources/images/icon/bus.svg';
import carSvg from '../../resources/images/icon/car.svg';
import camperSvg from '../../resources/images/icon/camper.svg';
import craneSvg from '../../resources/images/icon/crane.svg';
import defaultSvg from '../../resources/images/icon/default.svg';
import helicopterSvg from '../../resources/images/icon/helicopter.svg';
import motorcycleSvg from '../../resources/images/icon/motorcycle.svg';
import personSvg from '../../resources/images/icon/person.svg';
import planeSvg from '../../resources/images/icon/plane.svg';
import scooterSvg from '../../resources/images/icon/scooter.svg';
import shipSvg from '../../resources/images/icon/ship.svg';
import startSvg from '../../resources/images/icon/start.svg';
import shoppingBagIconSvg from '../../resources/images/icon/shoppingbag.svg';
import finishSvg from '../../resources/images/icon/finish.svg';
import tractorSvg from '../../resources/images/icon/tractor.svg';
import trainSvg from '../../resources/images/icon/train.svg';
import trailerSvg from '../../resources/images/icon/trailer.svg';
import tramSvg from '../../resources/images/icon/tram.svg';
import truckSvg from '../../resources/images/icon/truck.svg';
import vanSvg from '../../resources/images/icon/van.svg';
import { map } from './MapView.jsx';
import load3dImage from './icons3d'


export const mapIcons = {
  animal: animalSvg,
  bicycle: bicycleSvg,
  boat: boatSvg,
  bus: busSvg,
  car: carSvg,
  camper: camperSvg,
  crane: craneSvg,
  default: defaultSvg,
  finish: finishSvg,
  helicopter: helicopterSvg,
  motorcycle: motorcycleSvg,
  person: personSvg,
  plane: planeSvg,
  scooter: scooterSvg,
  shoppingbag: shoppingBagIconSvg,
  ship: shipSvg,
  start: startSvg,
  tractor: tractorSvg,
  trailer: trailerSvg,
  trailer2: trailerSvg,
  train: trainSvg,
  tram: tramSvg,
  truck: truckSvg,
  van: vanSvg,
};

export const mapIconKey = (category) => (mapIcons.hasOwnProperty(category) ? category : 'default');

export const mapImages = {};

const mapPalette = createPalette({
  neutral: { main: grey[500] },
});

map.on('styleimagemissing', load3dImage);

export default async () => {
  const background = await loadImage(backgroundSvg);
  mapImages.background = await prepareIcon(background);
  mapImages.direction = await prepareIcon(await loadImage(directionSvg));
  await Promise.all(Object.keys(mapIcons).map(async (category) => {
    const results = [];
    ['info', 'success', 'error', 'neutral'].forEach((color) => {
      results.push(loadImage(mapIcons[category]).then((icon) => {
        mapImages[`${category}-${color}`] = prepareIcon(background, icon, mapPalette[color].main);
      }));
    });
    await Promise.all(results);
  }));
  for (let i=0; i<360; i+= 22.5) {
    await Promise.all(['car', 'truck', 'default'].map((icon) => loadId(icon, i)))
  }
};

async function loadId(icon, i) {
  const id = `${icon}-neutral-${i}`
  mapImages[id] = await load3dImage({id}, false)
}
