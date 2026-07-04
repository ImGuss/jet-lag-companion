import {
  featureCollection,
  difference,
  union,
  circle,
  booleanContains
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

type RadiusValidation =
  | { ok: true }
  | { ok: false; reason: 'full-elim' | 'no-elim' }

// private helpers
const buildFeatureCollection = (features: Feature<Polygon | MultiPolygon>[]) => {
  return featureCollection(features)
}

const featureDiff = (subject: Feature<MultiPolygon | Polygon>, clip: Feature<MultiPolygon | Polygon>) => {
  const featureToClip = buildFeatureCollection([subject, clip])

  return difference(featureToClip)
}

// exported helpers
export const buildCircle = ({ center, radius }: BuildCircleArgs): Feature<Polygon> => {
  const options = {
    steps: 64,
    units: 'meters' as Units
  }

  return circle(center, radius, options)
}

export const unionCountryGeo = (countries: ActiveCountry[]) => {
  if (countries.length === 0) {
    return null
  }

  if (countries.length === 1) {
    return countries[0].geometry
  }

  const countryGeoArray = countries.map(country => country.geometry)

  const countryGeo = countryGeoArray.reduce((acc, curr) => {
    // non-null assertion because practically impossible for two separate countries to combine into a null geometry
    return union(buildFeatureCollection([acc!, curr]))
  })

  return countryGeo!
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
}: ValidateRadiusMarkerArgs): RadiusValidation => {
  if (!activeGeometry) { return { ok: true } }

  const isContained = booleanContains(circleFeature, activeGeometry)

  if (!isContained) { return { ok: true } }

  if (withinRadius) {
    return { ok: false, reason: 'no-elim' }
  }

  return { ok: false, reason: 'full-elim' }
}