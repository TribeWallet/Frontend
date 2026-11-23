import * as React from 'react';
import { createText, createBox } from '@shopify/restyle';
import { Pressable } from 'react-native';

import { lightTheme, darkTheme, type Theme } from './restyle';

export type AppTheme = Theme;

export const Box = createBox<Theme>();
export const Text = createText<Theme>();

export { lightTheme, darkTheme };
export { useTheme } from '@shopify/restyle';
export type { Theme } from './restyle';

export function PressableBox(props: any) {
  return React.createElement(Pressable, props);
}
