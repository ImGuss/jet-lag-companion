import { featureCollection, difference, union } from '@turf/turf'

import type { ActiveCountry } from '@shared/types'
import type { Feature, MultiPolygon, Polygon } from 'geojson'

const buildFeatureCollection = (features: Feature<Polygon | MultiPolygon>[]) => {
  return featureCollection(features)
}

const featureDiff = (subject: Feature<MultiPolygon | Polygon>, clip: Feature<MultiPolygon | Polygon>) => {
  const featureToClip = buildFeatureCollection([subject, clip])

  return difference(featureToClip)
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