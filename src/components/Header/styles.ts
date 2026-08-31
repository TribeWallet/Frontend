import React from 'react';
import {View, Text} from 'react-native';
import {WalletCards} from 'lucide-react-native';
import {styles} from './styles';

interface HeaderProps {
  title?: string;
}

export function Header({title = 'TribeWallet'}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <WalletCards
          size={16}
          color="#FFFFFF"
          strokeWidth={1.7}
        />
      </View>

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}