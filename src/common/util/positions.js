import {distance, point} from '@turf/turf';

const tDistance = (a,b) => distance(point([a.longitude, a.longitude]),
    point([b.longitude, b.longitude]))

const minDistance = 0.015
const minCourseDiff = 5

export const reducePositions = (acc, curr, index, positions) => {
    if (index === 0) {
        acc.push(curr);
    } else {
        const prev = positions[index - 1];
        if (tDistance(prev, curr) >= minDistance || Math.abs(prev.course - curr.course) >= minCourseDiff) {
            acc.push(curr);
        }
    }
    return acc;
}
