import { StormGlass } from '@src/clients/StormGlass';
import { ForecastProcessingInternalError } from '@src/services/forecast';
import { Forecast } from '@src/services/forecast';
import stormGlassNormalizedResponseFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forecast_response_1_beach.json';
import { Beach, BeachPosition } from '@src/models/beach';

jest.mock('@src/clients/StormGlass');

describe('Forecast Service', () => {
  const mockedStormGlassService = new StormGlass() as jest.Mocked<StormGlass>;
  it('should return the forecast for a list of beaches', async () => {
    mockedStormGlassService.fetchPoints.mockResolvedValue(
      stormGlassNormalizedResponseFixture
    );
    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
      },
    ];
    const expectedResponse = apiForecastResponse1BeachFixture;
    const forecast = new Forecast(mockedStormGlassService);
    const beachesWithRating = await forecast.processForecastForBeaches(beaches);
    expect(beachesWithRating).toEqual(expectedResponse);
  });

  it('should return an empty list when the beaches array is empty', async () => {
    const forecast = new Forecast();
    const response = await forecast.processForecastForBeaches([]);
    expect(response).toEqual([]);
  });

  it('should throw internal processing error when something goes wrong during the rating process', async () => {
    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
      },
    ];
    mockedStormGlassService.fetchPoints.mockRejectedValue(
      'Error fetching data'
    );
    const forecast = new Forecast(mockedStormGlassService);
    await expect(forecast.processForecastForBeaches(beaches)).rejects.toThrow(
      ForecastProcessingInternalError
    );
  });
});
