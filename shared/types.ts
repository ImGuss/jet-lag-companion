import type { Feature, Polygon, MultiPolygon } from 'geojson'

export interface GameState {
  activeCountries: ActiveCountry[];
  activeGeometry: ActiveGeometry
  eliminatedRegions: EliminatedRegion[];
  radiusMarkers: RadiusMarker[];
  bisectorMarkers: BisectorMarker[];
  isSelectingCountries: boolean;
}

export interface RadiusMarker {
  id: string;
  center: [number, number];
  radius: number;
  withinRadius: boolean;
}

export interface BisectorMarker {
  id: string;
  startPoint: [number, number];
  endPoint: [number, number];
  isCloserToEnd: boolean;
}

export interface EliminatedRegion {
  id: string;
  geometry: Feature<Polygon | MultiPolygon>;
  sourceMarkerType: 'radius' | 'bisector';
  sourceMarkerId: string;
}

export interface ActiveCountry {
  code: string;
  geometry: Feature<Polygon | MultiPolygon>
}

export type ActiveGeometry = Feature<Polygon | MultiPolygon> | null;