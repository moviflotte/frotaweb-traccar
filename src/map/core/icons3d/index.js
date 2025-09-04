import car from './default'
import truck from './truck'
import {loadImage, prepareIcon} from "../mapUtil.js";
import {map} from "../MapView.jsx";
import {mapIconKey, mapIcons} from "../preloadImages";
import backgroundSvg from "../../../resources/images/background.svg";
const baseUrl = '/icons3d'
import createPalette from '@mui/material/styles/createPalette';
import {getStatusColor} from "../../../common/util/formatter";

export const icons = {
    default: truck,
    car,
    truck
}

export const iconsRemote = {
    tractor: 'tractor_v2',
    bus: 'bus_85',
    bicycle: 'bici_40',
    boat: 'barco',
    crane: 'grua_60',
    motorcycle: 'moto_50',
    offroad: 'quadbike_45',
    pickup: 'pickup_60',
    scooter: 'motoneta_45',
    van: 'furgoneta_ventana_60',
    trailer: 'remolque_caja_70',
    trailer2: 'remolque_jaula'
}

export function getSVG(iconPath, height=60, width=60, viewBox="0 0 50 50") {
    return `
        <svg preserveaspectratio="none" height="${height}" width="${width}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">            
            ${iconPath}
        </svg>
    `
}

const background = loadImage(backgroundSvg)
const imageCache = {}

const mapPalette = createPalette({});

export function getColor(color) {
    return color === 'neutral' ? '#FE795D' : mapPalette[color] && mapPalette[color].main;
}

export default async (e, addToMap = true) => {
    if (!/^[a-z]+[0-9]?-[a-z]+-[0-9.]+$/.test(e.id)) {
        console.log('ignoring image', e.id)
        return;
    }
    if (map.getStyle() && map.hasImage(e.id)) {
        return;
    }
    if (!imageCache[e.id]) {
        const [category, color, rotation] = e.id.split('-')
        const _color = getColor(color);
        if (icons[category]) {
            const svg = icons[category](rotation, _color, mapPalette);
            const svgBlob = new Blob([svg], {type: 'image/svg+xml;charset=utf-8'});
            imageCache[e.id] = await loadImage(URL.createObjectURL(svgBlob)).then(icon =>
                prepareIcon(icon))
        } else if (iconsRemote[category]) {
            const c = _color.replace('#', '')
            imageCache[e.id] = await loadImage(`${baseUrl}/${iconsRemote[category]}.php?grados=${rotation}&a=${c}&b=${c}&c=${c}`)
                .then(icon => prepareIcon(icon))
        } else {
            imageCache[e.id] = prepareIcon(await background, await loadImage(mapIcons[category]), _color)
        }
    }

    if (map.getStyle() && !map.hasImage(e.id) && addToMap) {
        map.addImage(e.id, imageCache[e.id], {
            pixelRatio: window.devicePixelRatio,
        })
    }
    return imageCache[e.id]
}

export function getSVGIcon(device, position) {
    const category = device.category || 'default'
    const color = getColor(getStatusColor(device.status))
    const rotation = position && (position.course - position.course % 22.5) || 0
    if (icons[category]) {
        return icons[category](rotation, color)
            .replace(/\.cls-(\d+)/g, `.cls-$1-${device.id}`)
            .replace(/class="cls-(\d+)"/g, `class="cls-$1-${device.id}"`)
    } else if (iconsRemote[category]) {
        const c = color.replace('#', '')
        const url = `${baseUrl}/${iconsRemote[category]}.php?grados=${rotation}&a=${c}&b=${c}&c=${c}`
        return `<img src="${url}" width="60" height="60" alt="${category}" />`
    } else {
        return `<img src="${mapIcons[mapIconKey(category)]}" width="60" height="60" alt="" style="filter:brightness(0) invert(1)"/>`
    }
}
