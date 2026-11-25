import React from 'react';
import { View } from 'react-native';

// Mock do react-native-vector-icons para ambiente de teste (Jest/Node).
// Retorna um View vazio para não quebrar a renderização dos testes.
export const Feather: React.FC = () => React.createElement(View);

export default Feather;
