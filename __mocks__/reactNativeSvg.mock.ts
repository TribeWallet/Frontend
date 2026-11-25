// Mock do react-native-svg para testes em ambiente Node
// Fornece componentes SVG mínimos que aceitam props sem lançar erro
import React from 'react';

export const Svg = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('svg-mock', { ref, ...rest }, children);
});
Svg.displayName = 'Svg';

export const Circle = React.forwardRef((props, ref) => {
  const { ...rest } = props;
  return React.createElement('circle-mock', { ref, ...rest });
});
Circle.displayName = 'Circle';

export const Path = React.forwardRef((props, ref) => {
  const { ...rest } = props;
  return React.createElement('path-mock', { ref, ...rest });
});
Path.displayName = 'Path';

export const Rect = React.forwardRef((props, ref) => {
  const { ...rest } = props;
  return React.createElement('rect-mock', { ref, ...rest });
});
Rect.displayName = 'Rect';

export const Line = React.forwardRef((props, ref) => {
  const { ...rest } = props;
  return React.createElement('line-mock', { ref, ...rest });
});
Line.displayName = 'Line';

export const G = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('g-mock', { ref, ...rest }, children);
});
G.displayName = 'G';

export const Defs = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('defs-mock', { ref, ...rest }, children);
});
Defs.displayName = 'Defs';

export const Use = React.forwardRef((props, ref) => {
  const { ...rest } = props;
  return React.createElement('use-mock', { ref, ...rest });
});
Use.displayName = 'Use';

export const Text = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('svg-text-mock', { ref, ...rest }, children);
});
Text.displayName = 'SvgText';

export const TSpan = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('tspan-mock', { ref, ...rest }, children);
});
TSpan.displayName = 'TSpan';

export const Mask = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('mask-mock', { ref, ...rest }, children);
});
Mask.displayName = 'Mask';

export const ClipPath = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('clipPath-mock', { ref, ...rest }, children);
});
ClipPath.displayName = 'ClipPath';

export const Symbol = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('symbol-mock', { ref, ...rest }, children);
});
Symbol.displayName = 'Symbol';

export const LinearGradient = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('linearGradient-mock', { ref, ...rest }, children);
});
LinearGradient.displayName = 'LinearGradient';

export const Stop = React.forwardRef((props, ref) => {
  const { ...rest } = props;
  return React.createElement('stop-mock', { ref, ...rest });
});
Stop.displayName = 'Stop';

export default Svg;
