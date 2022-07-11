import { Beach, GeoPosition } from '@src/models/beach';
import { ForecastPoint } from '@src/clients/StormGlass';

const waveHeights = {
  ankleToKnee: {
    min: 0.3,
    max: 1.0,
  },
  waisHigh: {
    min: 1.0,
    max: 2.0,
  },
  headHigh: {
    min: 2.0,
    max: 2.5,
  },
};

export class Rating {
  constructor(private beach: Beach) {}

  public getRatingBasedOnWindAndWavePositions(
    wavePosition: GeoPosition,
    windPosition: GeoPosition
  ): number {
    if (wavePosition === windPosition) {
      return 1;
    } else if (this.isWindOfShore(wavePosition, windPosition)) {
      return 5;
    }
    return 3;
  }

  public getRatingForSwellPeriod(period: number): number {
    if (period >= 7 && period < 10) {
      return 2;
    } else if (period >= 10 && period < 14) {
      return 4;
    } else if (period >= 14) {
      return 5;
    } else {
      return 1;
    }
  }

  public getRatingForSwellSize(height: number): number {
    if (
      height >= waveHeights.ankleToKnee.min &&
      height < waveHeights.ankleToKnee.max
    ) {
      return 2;
    } else if (
      height >= waveHeights.waisHigh.min &&
      height < waveHeights.waisHigh.max
    ) {
      return 3;
    } else if (height >= waveHeights.headHigh.min) {
      return 5;
    } else {
      return 1;
    }
  }

  public getPositionFromLocation(coordinate: number): GeoPosition {
    if (coordinate >= 310 || (coordinate < 50 && coordinate >= 0)) {
      return GeoPosition.N;
    } else if (coordinate >= 50 && coordinate < 120) {
      return GeoPosition.E;
    } else if (coordinate >= 120 && coordinate < 220) {
      return GeoPosition.S;
    } else if (coordinate >= 220 && coordinate < 310) {
      return GeoPosition.W;
    } else {
      return GeoPosition.E;
    }
  }

  public getRateForPoint(point: ForecastPoint): number {
    const swellDirection = this.getPositionFromLocation(point.swellDirection);
    const windDirection = this.getPositionFromLocation(point.windDirection);
    const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(
      swellDirection,
      windDirection
    );
    const swellHeightRating = this.getRatingForSwellSize(point.swellHeight);
    const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod);
    const finalRating =
      (windAndWaveRating + swellPeriodRating + swellHeightRating) / 3;

    return Math.round(finalRating);
  }

  private isWindOfShore(
    wavePosition: GeoPosition,
    windPosition: GeoPosition
  ): boolean {
    return (
      (wavePosition === GeoPosition.N &&
        windPosition === GeoPosition.S &&
        this.beach.position === GeoPosition.N) ||
      (wavePosition === GeoPosition.S &&
        windPosition === GeoPosition.N &&
        this.beach.position === GeoPosition.S) ||
      (wavePosition === GeoPosition.E &&
        windPosition === GeoPosition.W &&
        this.beach.position === GeoPosition.E) ||
      (wavePosition === GeoPosition.W &&
        windPosition === GeoPosition.E &&
        this.beach.position === GeoPosition.W)
    );
  }
}
