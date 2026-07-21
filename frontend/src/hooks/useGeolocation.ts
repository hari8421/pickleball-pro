import { useState, useCallback } from 'react';

type GeolocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; coords: { latitude: number; longitude: number } }
  | { status: 'error'; message: string };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' });

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        status: 'error',
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setState({ status: 'loading' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'success',
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      () => {
        setState({
          status: 'error',
          message: 'Geolocation denied. Enter coordinates manually.',
        });
      },
      { timeout: 10000 }
    );
  }, []);

  return { state, request };
}
