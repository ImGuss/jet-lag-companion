import {
  featureCollection,
  difference,
  intersect,
  union,
  circle,
  booleanContains,
  booleanIntersects,
  midpoint,
  bearing,
  bbox,
  distance,
  destination,
  polygon
} from '@turf/turf'

import type { Feature, MultiPolygon, Polygon } from 'geojson'
import type { Units } from '@turf/turf'
import type {
  ActiveCountry,
  EliminatedRegion,
  ActiveGeometry
} from '@shared/types'

// types
type BuildCircleArgs = {
  center: [number, number];
  radius: number;
}

type DeriveActiveGeometryArgs = {
  activeCountries: ActiveCountry[];
  eliminatedRegions: EliminatedRegion[];
}

type ValidateRadiusMarkerArgs = {
  circleFeature: Feature<Polygon>;
  activeGeometry: ActiveGeometry;
  withinRadius: boolean;
}

type ElimAreaValidation =
  | { ok: true }
  | { ok: false; reason: 'full-elim' | 'no-elim' }

type RadiusEliminationArgs = {
  circleFeature: Feature<Polygon>;
  // not using ActiveGeometry type because this should not be null
  activeGeometry: Feature<Polygon | MultiPolygon>;
  withinRadius: boolean;
}

type ValidateElimAreaArgs = {
  elimFeature: Feature<Polygon>,
  // not using ActiveGeometry type because this should not be null
  activeGeometry: Feature<Polygon | MultiPolygon>
}

type BuildBisectedPolyArgs = {
  startPoint: [number, number],
  endPoint: [number, number],
  isCloserToEnd: boolean,
  // not using ActiveGeometry type because this should not be null
  activeGeometry: Feature<Polygon | MultiPolygon>
}

// private helpers
const buildFeatureCollection = (features: Feature<Polygon | MultiPolygon>[]) => {
  return featureCollection(features)
}

const featureDiff = (subject: Feature<Polygon | MultiPolygon>, clip: Feature<MultiPolygon | Polygon>) => {
  const featureToClip = buildFeatureCollection([subject, clip])

  return difference(featureToClip)
}

const unionCountryGeo = (countries: ActiveCountry[]) => {
  if (countries.length === 0) {
    return null
  }

  if (countries.length === 1) {
    return countries[0].geometry
  }

  const countryGeoArray = countries.map(country => country.geometry)

  const countryGeo = countryGeoArray.reduce((acc, curr) => {
    // non-null assertion because practically impossible for two separate countries to combine into a null geometry
    return union(buildFeatureCollection([acc, curr]))!
  })

  return countryGeo
}


// exported helpers
export const buildCircle = ({ center, radius }: BuildCircleArgs): Feature<Polygon> => {
  const options = {
    steps: 64,
    units: 'meters' as Units
  }

  return circle(center, radius, options)
}

export const buildBisectedPoly = ({
  startPoint,
  endPoint,
  isCloserToEnd,
  activeGeometry
}: BuildBisectedPolyArgs) => {
  const midPoint = midpoint(startPoint, endPoint)

  const bearingAngle = bearing(startPoint, midPoint)
  const leftBearing = bearingAngle - 90
  const rightBearing = bearingAngle + 90
  const reverseBearing = bearingAngle + 180
  const eliminatedBearing = isCloserToEnd ? reverseBearing : bearingAngle
  
  const options = { units: 'meters' as Units }

  // calculates a line that goes beyond the active play area
  // to make sure the full play area gets cut in half
  const activeBBox = bbox(activeGeometry)
  // takes the bottom left edge and the top right edge of active geo
  const from = [activeBBox[0], activeBBox[1]]
  const to = [activeBBox[2], activeBBox[3]]
  // calculates the distance and multiplies it to elongate the line
  const extensionDistance = distance(from, to, options) * 1.2

  const leftEnd = destination(midPoint, extensionDistance, leftBearing, options)
  const rightEnd = destination(midPoint, extensionDistance, rightBearing, options)

  const leftEndExt = destination(leftEnd, extensionDistance, eliminatedBearing, options)
  const rightEndExt = destination(rightEnd, extensionDistance, eliminatedBearing, options)

  const eliminatedPolygon = polygon([[
    leftEnd.geometry.coordinates,
    rightEnd.geometry.coordinates,
    rightEndExt.geometry.coordinates,
    leftEndExt.geometry.coordinates,
    leftEnd.geometry.coordinates
  ]])

  return eliminatedPolygon.geometry
}

export const deriveActiveGeometry = ({
  activeCountries,
  eliminatedRegions
}: DeriveActiveGeometryArgs): ActiveGeometry => {
  const baseGeo = unionCountryGeo(activeCountries)

  if (!baseGeo) { return null }

  const derivedGeo = eliminatedRegions.reduce((acc, curr) => {
    if (!acc) { return null }

    return featureDiff(acc, curr.geometry)
  }, baseGeo)

  return derivedGeo
}

export const validateRadiusMarker = ({
  circleFeature,
  activeGeometry,
  withinRadius
}: ValidateRadiusMarkerArgs): ElimAreaValidation => {
  if (!activeGeometry) { return { ok: true } }

  const isContained = booleanContains(circleFeature, activeGeometry)

  if (!isContained) { return { ok: true } }

  if (withinRadius) {
    return { ok: false, reason: 'no-elim' }
  }

  return { ok: false, reason: 'full-elim' }
}

export const validateElimArea = ({ elimFeature, activeGeometry }: ValidateElimAreaArgs): ElimAreaValidation => {
  if (!activeGeometry) { return { ok: true } }

  const isContained = booleanContains(elimFeature, activeGeometry)

  if (isContained) { return { ok: false, reason: 'full-elim' } }

  const intersects = booleanIntersects(elimFeature, activeGeometry)

  if (!intersects) { return { ok: false, reason: 'no-elim' } }

  return { ok: true }
}

export const radiusElimination = ({
  circleFeature,
  activeGeometry,
  withinRadius
}: RadiusEliminationArgs): Feature<Polygon | MultiPolygon> => {
  const featureToIntersect = buildFeatureCollection([circleFeature, activeGeometry])

  // non-null assertion since validateRadiusMarker already rules out
  // intersect returning null
  const intersectedFeature = intersect(featureToIntersect)!

  if (withinRadius) {
    return featureDiff(activeGeometry, intersectedFeature)!
  }

  return intersectedFeature
}