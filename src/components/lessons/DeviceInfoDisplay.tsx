import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Monitor, Tablet, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface DeviceInfoDisplayProps {
  deviceType: string;
}

export const DeviceInfoDisplay: React.FC<DeviceInfoDisplayProps> = ({ deviceType }) => {
  const [isOpen, setIsOpen] = useState(false);

  // If it's a basic device type (old format), display it simply
  if (['mobile', 'tablet', 'desktop', 'unknown'].includes(deviceType)) {
    return getBasicDeviceDisplay(deviceType);
  }

  // If it's a detailed device fingerprint (new format), parse and display it
  const deviceInfo = parseDeviceFingerprint(deviceType);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-purple-500/10 p-1 rounded transition-colors">
          {getDeviceIcon(deviceInfo.deviceModel)}
          <span className="text-sm font-medium text-purple-200">
            {deviceInfo.deviceModel}
          </span>
          {isOpen ? (
            <ChevronUp className="h-3 w-3 text-purple-300" />
          ) : (
            <ChevronDown className="h-3 w-3 text-purple-300" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="bg-purple-500/10 rounded-lg p-3 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-purple-300 font-medium">OS:</span>
              <span className="text-purple-200 ml-1">{deviceInfo.osVersion}</span>
            </div>
            <div>
              <span className="text-purple-300 font-medium">Browser:</span>
              <span className="text-purple-200 ml-1">{deviceInfo.browserInfo}</span>
            </div>
            <div>
              <span className="text-purple-300 font-medium">Screen:</span>
              <span className="text-purple-200 ml-1">{deviceInfo.screenResolution}</span>
            </div>
            <div>
              <span className="text-purple-300 font-medium">Platform:</span>
              <span className="text-purple-200 ml-1">{deviceInfo.platform}</span>
            </div>
          </div>
          <div className="text-purple-300 text-xs opacity-75">
            Click to expand device details
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

function getBasicDeviceDisplay(deviceType: string) {
  const icon = getDeviceIcon(deviceType);
  const color = getDeviceColor(deviceType);
  
  return (
    <Badge className={color}>
      {icon}
      <span className="ml-1">{deviceType.toUpperCase()}</span>
    </Badge>
  );
}

function getDeviceIcon(deviceType: string) {
  switch (deviceType.toLowerCase()) {
    case 'mobile':
    case 'iphone':
    case 'samsung':
    case 'xiaomi':
    case 'oneplus':
    case 'huawei':
      return <Smartphone className="h-3 w-3" />;
    case 'tablet':
    case 'ipad':
      return <Tablet className="h-3 w-3" />;
    case 'desktop':
    case 'windows':
    case 'mac':
    case 'linux':
      return <Monitor className="h-3 w-3" />;
    default:
      return <Info className="h-3 w-3" />;
  }
}

function getDeviceColor(deviceType: string) {
  switch (deviceType.toLowerCase()) {
    case 'mobile':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'tablet':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'desktop':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
}

function parseDeviceFingerprint(fingerprint: string) {
  const parts = fingerprint.split('|');
  
  return {
    deviceModel: parts[0] || 'unknown',
    osVersion: parts[1] || 'unknown',
    browserInfo: parts[2] || 'unknown',
    screenResolution: parts[3] || 'unknown',
    colorDepth: parts[4] || 'unknown',
    pixelRatio: parts[5] || 'unknown',
    platform: parts[6] || 'unknown',
    language: parts[7] || 'unknown',
    timezone: parts[8] || 'unknown'
  };
}
