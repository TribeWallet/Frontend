// Mock do @shopify/restyle para testes em ambiente Node
// Fornece useTheme e createText/createBox mínimos
import React from 'react';

export function useTheme() {
  return {
    colors: {
      text: '#171717',
      textSecondary: '#6D7379',
      textMuted: '#8C949B',
      danger: '#EF5067',
      dangerLight: '#FDE8EB',
      primary: '#0071DF',
      background: '#F8FAFB',
      surface: '#FFFFFF',
      white: '#FFFFFF',
      black: '#000000',
      placeholder: '#8C949B',
      border: '#DFE4E7',
      cardBorder: '#E4E7E9',
    },
    spacing: { none: 0, xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 },
    breakpoints: { phone: 0, tablet: 768 },
    textVariants: {},
    borderRadii: { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
    shadows: {},
    zIndices: { base: 0, dropdown: 100, sticky: 200, modal: 300, toast: 400 },
  };
}

export function createText() {
  return React.forwardRef((props, ref) => {
    const { children, style, ...rest } = props;
    return React.createElement('Text', { ref, ...rest }, children);
  });
}

export function createBox() {
  return React.forwardRef((props, ref) => {
    const { children, style, ...rest } = props;
    return React.createElement('box', { ref, ...rest }, children);
  });
}

export function createTheme(theme: any) {
  return theme;
}
