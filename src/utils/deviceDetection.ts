import * as React from 'react';

/**
 * Device detection utility for tracking device types in lesson views
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

/**
 * Detects device type based on user agent and screen dimensions
 * @returns DeviceType - the detected device type
 */
export function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Check for mobile devices
  if (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
    (screenWidth <= 768 && screenHeight <= 1024) ||
    (viewportWidth <= 768 && viewportHeight <= 1024)
  ) {
    // Distinguish between mobile and tablet
    if (
      /ipad|android.*\b(?:tablet|tab|playbook|silk)/i.test(userAgent) ||
      (screenWidth > 768 && screenWidth <= 1024) ||
      (viewportWidth > 768 && viewportWidth <= 1024)
    ) {
      return 'tablet';
    }
    return 'mobile';
  }

  // Check for tablet devices
  if (
    /ipad|android.*\b(?:tablet|tab|playbook|silk)/i.test(userAgent) ||
    (screenWidth > 768 && screenWidth <= 1024) ||
    (viewportWidth > 768 && viewportWidth <= 1024)
  ) {
    return 'tablet';
  }

  // Check for desktop
  if (
    /windows|macintosh|linux/i.test(userAgent) ||
    screenWidth > 1024 ||
    viewportWidth > 1024
  ) {
    return 'desktop';
  }

  return 'unknown';
}

/**
 * Gets detailed device fingerprint for unique device identification
 * This combines multiple device characteristics to create a unique identifier
 * @returns String with detailed device information
 */
export function getDetailedDeviceFingerprint(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'unknown';
  }

  const userAgent = navigator.userAgent;
  const platform = navigator.platform || 'unknown';
  const language = navigator.language || 'unknown';
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const colorDepth = window.screen.colorDepth || 0;
  const pixelRatio = window.devicePixelRatio || 1;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
  
  // Get more specific device info
  let deviceModel = 'unknown';
  let osVersion = 'unknown';
  let browserInfo = 'unknown';

  // Detect mobile device models
  if (/iphone/i.test(userAgent)) {
    const match = userAgent.match(/iPhone\s*(?:OS\s*)?(\d+[_\d]*)/i);
    osVersion = match ? `iOS_${match[1].replace(/_/g, '.')}` : 'iOS_unknown';
    
    // Try to detect iPhone model
    if (/iPhone\s*1[1-5]/i.test(userAgent)) {
      deviceModel = 'iPhone_11-15';
    } else if (/iPhone\s*X/i.test(userAgent)) {
      deviceModel = 'iPhone_X';
    } else if (/iPhone\s*[6-8]/i.test(userAgent)) {
      deviceModel = 'iPhone_6-8';
    } else {
      deviceModel = 'iPhone_other';
    }
  } else if (/android/i.test(userAgent)) {
    const match = userAgent.match(/Android\s*(\d+[\.\d]*)/i);
    osVersion = match ? `Android_${match[1]}` : 'Android_unknown';
    
    // Try to detect Android device model
    if (/samsung/i.test(userAgent)) {
      if (/SM-G/i.test(userAgent)) {
        deviceModel = 'Samsung_Galaxy';
      } else if (/SM-A/i.test(userAgent)) {
        deviceModel = 'Samsung_A';
      } else {
        deviceModel = 'Samsung_other';
      }
    } else if (/xiaomi/i.test(userAgent)) {
      deviceModel = 'Xiaomi';
    } else if (/oneplus/i.test(userAgent)) {
      deviceModel = 'OnePlus';
    } else if (/huawei/i.test(userAgent)) {
      deviceModel = 'Huawei';
    } else {
      deviceModel = 'Android_other';
    }
  } else if (/windows/i.test(userAgent)) {
    const match = userAgent.match(/Windows\s*NT\s*(\d+\.\d+)/i);
    osVersion = match ? `Windows_${match[1]}` : 'Windows_unknown';
    deviceModel = 'Windows_PC';
  } else if (/macintosh/i.test(userAgent)) {
    const match = userAgent.match(/Mac\s*OS\s*X\s*(\d+[_\d]*)/i);
    osVersion = match ? `macOS_${match[1].replace(/_/g, '.')}` : 'macOS_unknown';
    deviceModel = 'Mac';
  } else if (/linux/i.test(userAgent)) {
    osVersion = 'Linux';
    deviceModel = 'Linux_PC';
  }

  // Detect browser
  if (/chrome/i.test(userAgent)) {
    const match = userAgent.match(/Chrome\/(\d+)/i);
    browserInfo = match ? `Chrome_${match[1]}` : 'Chrome';
  } else if (/firefox/i.test(userAgent)) {
    const match = userAgent.match(/Firefox\/(\d+)/i);
    browserInfo = match ? `Firefox_${match[1]}` : 'Firefox';
  } else if (/safari/i.test(userAgent)) {
    const match = userAgent.match(/Version\/(\d+)/i);
    browserInfo = match ? `Safari_${match[1]}` : 'Safari';
  } else if (/edge/i.test(userAgent)) {
    const match = userAgent.match(/Edge\/(\d+)/i);
    browserInfo = match ? `Edge_${match[1]}` : 'Edge';
  }

  // Create a unique device fingerprint
  const fingerprint = [
    deviceModel,
    osVersion,
    browserInfo,
    `${screenWidth}x${screenHeight}`,
    `color_${colorDepth}`,
    `ratio_${pixelRatio}`,
    platform,
    language,
    timezone
  ].join('|');

  return fingerprint;
}

/**
 * Gets device information including type and additional details
 * @returns Object with device type and additional info
 */
export function getDeviceInfo() {
  const deviceType = detectDeviceType();
  
  return {
    type: deviceType,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Hook for React components to get current device type
 * @returns DeviceType - the current device type
 */
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = React.useState<DeviceType>('unknown');

  React.useEffect(() => {
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
