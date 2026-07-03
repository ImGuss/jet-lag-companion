import type { Feature, Polygon, MultiPolygon } from 'geojson'

export interface GameState {
  activeCountries: ActiveCountry[];
  activeGeometry: Feature<Polygon | MultiPolygon> | null;
  eliminatedRegions: EliminatedRegion[];
  radiusMarkers: RadiusMarker[];
  isSelectingCountries: boolean;
}

export interface RadiusMarker {
  id: string;
  center: [number, number];
  radius: number;
  withinRadius: boolean;
}

export interface EliminatedRegion {
  id: string;
  geometry: Feature<Polygon | MultiPolygon>;
  sourceMarkerId?: string;
}

export interface ActiveCountry {
  code: string;
  geometry: Feature<Polygon | MultiPolygon>
}