import { useState, useEffect } from 'react';
import { detectDeviceType as detectDeviceTypeUtil, type DeviceType } from '@/utils/deviceDetection';

export { type DeviceType };

/**
 * Detects device type based on user agent and screen dimensions
 * @returns DeviceType - the detected device type
 */
export function detectDeviceType(): DeviceType {
  return detectDeviceTypeUtil();
}

/**
 * Hook for React components to get current device type
 * @returns DeviceType - the current device type
 */
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown');

  useEffect(() => {
    setDeviceType(detectDeviceType());

    const handleResize = () => {
      setDeviceType(detectDeviceType());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceType;
}
