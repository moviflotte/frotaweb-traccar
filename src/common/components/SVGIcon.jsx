import React from 'react';
import { icons, iconsRemote, getColor } from '../../map/core/icons3d/index.js';
import { getStatusColor } from '../util/formatter';
import { mapIconKey, mapIconComponents } from '../../map/core/preloadImages';

const baseUrl = '/icons3d';

const SVGIcon = ({ device, position, width = 50, height = 50 }) => {
  const category = device.category || 'default';
  const color = getColor(getStatusColor(device.status));
  const rotation = position && (position.course - position.course % 22.5) || 0;

  if (icons[category]) {
    const __html = icons[category](rotation, color)
      .replace(/\.cls-(\d+)/g, `.cls-$1-${device.id}`)
      .replace(/class="cls-(\d+)"/g, `class="cls-$1-${device.id}"`)
      .replace(/(width|height)="[^"]*"/g, `width="${width}" height="${height}"`)
    return (<div dangerouslySetInnerHTML={{ __html}} style={{  display: 'block', margin: '0 auto' }} />)
  } else if (iconsRemote[category]) {
    const c = color.replace('#', '');
    const url = `${baseUrl}/${iconsRemote[category]}.php?grados=${rotation}&a=${c}&b=${c}&c=${c}`;
    return (
      <img
        src={url}
        width={width}
        height={height}
        alt={category}
      />
    );
  } else {
    const IconComponent = mapIconComponents[mapIconKey(category)];
    return (
      <IconComponent
        width={width}
        height={height}
        style={{  fill: color,  display: 'block', margin: '0 auto' }}
      />
    );
  }
};

export default SVGIcon;
