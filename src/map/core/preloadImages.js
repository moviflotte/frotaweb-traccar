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
import pickupSvg from '../../resources/images/icon/pickup.svg';
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

import AnimalIcon from '../../resources/images/icon/animal.svg?react';
import BicycleIcon from '../../resources/images/icon/bicycle.svg?react';
import BoatIcon from '../../resources/images/icon/boat.svg?react';
import BusIcon from '../../resources/images/icon/bus.svg?react';
import CarIcon from '../../resources/images/icon/car.svg?react';
import CamperIcon from '../../resources/images/icon/camper.svg?react';
import CraneIcon from '../../resources/images/icon/crane.svg?react';
import DefaultIcon from '../../resources/images/icon/default.svg?react';
import HelicopterIcon from '../../resources/images/icon/helicopter.svg?react';
import MotorcycleIcon from '../../resources/images/icon/motorcycle.svg?react';
import PersonIcon from '../../resources/images/icon/person.svg?react';
import PickupIcon from '../../resources/images/icon/pickup.svg?react';
import PlaneIcon from '../../resources/images/icon/plane.svg?react';
import ScooterIcon from '../../resources/images/icon/scooter.svg?react';
import ShipIcon from '../../resources/images/icon/ship.svg?react';
import StartIcon from '../../resources/images/icon/start.svg?react';
import ShoppingBagIcon from '../../resources/images/icon/shoppingbag.svg?react';
import FinishIcon from '../../resources/images/icon/finish.svg?react';
import TractorIcon from '../../resources/images/icon/tractor.svg?react';
import TrainIcon from '../../resources/images/icon/train.svg?react';
import TrailerIcon from '../../resources/images/icon/trailer.svg?react';
import TramIcon from '../../resources/images/icon/tram.svg?react';
import TruckIcon from '../../resources/images/icon/truck.svg?react';
import VanIcon from '../../resources/images/icon/van.svg?react';

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
  pickup: pickupSvg,
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

export const mapIconComponents = {
  animal: AnimalIcon,
  bicycle: BicycleIcon,
  boat: BoatIcon,
  bus: BusIcon,
  car: CarIcon,
  camper: CamperIcon,
  crane: CraneIcon,
  default: DefaultIcon,
  finish: FinishIcon,
  helicopter: HelicopterIcon,
  motorcycle: MotorcycleIcon,
  person: PersonIcon,
  pickup: PickupIcon,
  plane: PlaneIcon,
  scooter: ScooterIcon,
  shoppingbag: ShoppingBagIcon,
  ship: ShipIcon,
  start: StartIcon,
  tractor: TractorIcon,
  trailer: TrailerIcon,
  trailer2: TrailerIcon,
  train: TrainIcon,
  tram: TramIcon,
  truck: TruckIcon,
  van: VanIcon,
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
