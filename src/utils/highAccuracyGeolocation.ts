/**
 * Ultra-High Accuracy Geolocation Engine
 *
 * Browsers and mobile devices typically emit a coarse WiFi/cellular estimate first (50m-500m)
 * before satellite hardware achieves full lock (3m-15m).
 *
 * This utility uses `watchPosition` with `maximumAge: 0` to continuously sample
 * incoming GPS fixes and returns the highest precision (lowest accuracy radius) fix.
 */

export interface AccuratePositionResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  rawPosition: GeolocationPosition;
}

export function getUltraAccuratePosition(options?: {
  timeoutMs?: number;
  desiredAccuracyMeters?: number;
}): Promise<AccuratePositionResult> {
  const timeoutMs = options?.timeoutMs ?? 6000;
  const desiredAccuracy = options?.desiredAccuracyMeters ?? 15; // 15 meters or better target

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }

    let bestSample: GeolocationPosition | null = null;
    let watchId: number | null = null;
    let isSettled = false;

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    };

    const settleSuccess = (pos: GeolocationPosition) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
        rawPosition: pos,
      });
    };

    const settleFail = (err: GeolocationPositionError) => {
      if (isSettled) return;
      if (bestSample) {
        // If we captured any reading before failure/timeout, use best sample
        settleSuccess(bestSample);
      } else {
        isSettled = true;
        cleanup();
        reject(err);
      }
    };

    // Timeout fallback: after timeoutMs, return the best sample collected
    const timer = setTimeout(() => {
      if (!isSettled) {
        if (bestSample) {
          settleSuccess(bestSample);
        } else {
          isSettled = true;
          cleanup();
          reject(new Error('GPS acquisition timed out. Please check that Location Services are enabled.'));
        }
      }
    }, timeoutMs);

    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const currentAcc = pos.coords.accuracy;

          // Track the sample with the lowest accuracy error radius
          if (!bestSample || currentAcc < bestSample.coords.accuracy) {
            bestSample = pos;
          }

          // If we reached our target accuracy threshold (e.g. <= 15m), resolve immediately
          if (currentAcc <= desiredAccuracy) {
            clearTimeout(timer);
            settleSuccess(pos);
          }
        },
        (err) => {
          // If we already have a sample, ignore non-fatal watch error and use best sample
          if (bestSample) {
            clearTimeout(timer);
            settleSuccess(bestSample);
          } else {
            clearTimeout(timer);
            settleFail(err);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: timeoutMs,
          maximumAge: 0, // Never use cached position!
        }
      );
    } catch (e: any) {
      clearTimeout(timer);
      cleanup();
      // Fallback to single getCurrentPosition if watchPosition fails
      navigator.geolocation.getCurrentPosition(
        (pos) => settleSuccess(pos),
        (err) => settleFail(err),
        { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
      );
    }
  });
}

