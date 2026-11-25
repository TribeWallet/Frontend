// Mock do @react-navigation/native-stack para testes em ambiente Node
import React from 'react';

export const createNativeStackNavigator = () => {
  const Navigator = ({ children }) => React.createElement('stack-navigator-mock', {}, children);
  const Screen = ({ children }) => React.createElement('stack-screen-mock', {}, children);
  const Group = ({ children }) => React.createElement('stack-group-mock', {}, children);
  return { Navigator, Screen, Group };
};

export default {
  createNativeStackNavigator,
};
