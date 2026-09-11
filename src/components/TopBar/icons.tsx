import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export function MenuIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 7.5H19M5 12H19M5 16.5H19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BellIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.3 9.6c0-3.45-2.05-5.8-5.3-6.18V2.5a1 1 0 0 0-2 0v.92C7.75 3.8 5.7 6.15 5.7 9.6c0 4.04-1.57 4.78-2.1 5.73-.37.67.1 1.5.87 1.5h15.06c.77 0 1.24-.83.87-1.5-.53-.95-2.1-1.69-2.1-5.73Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 19c.43 1.07 1.26 1.6 2.5 1.6s2.07-.53 2.5-1.6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SearchIcon({
  size = 14,
  color = 'currentColor',
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.8 10.8a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm5.2 11.7 4.3-4.3"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 13, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function WalletIcon({
  size = 13,
  color = 'currentColor',
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 6h17v12h-17z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path
        d="M3.5 10h17"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}
