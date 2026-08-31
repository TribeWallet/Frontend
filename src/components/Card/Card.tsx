import React, {ReactNode} from 'react';
import {View} from 'react-native';
import {styles} from './styles';

interface CardProps {
  children: ReactNode;
}

export function Card({children}: CardProps) {
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}