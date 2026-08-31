import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

export function TribeWalletLogo() {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
        >
          <Rect
            x="5"
            y="5"
            width="14"
            height="14"
            rx="2.2"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />

          <Path
            d="M8 9H13.2"
            stroke="#FFFFFF"
            strokeWidth="1.3"
            strokeLinecap="round"
          />

          <Path
            d="M8 12H15.5"
            stroke="#FFFFFF"
            strokeWidth="1.3"
            strokeLinecap="round"
          />

          <Path
            d="M8 15H12.2"
            stroke="#FFFFFF"
            strokeWidth="1.3"
            strokeLinecap="round"
          />

          <Path
            d="M15.8 7.3V10.4"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          <Path
            d="M14.25 8.85H17.35"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <Text style={styles.text}>
        TribeWallet
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,

    backgroundColor: '#087BE5',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,
  },

  text: {
    fontSize: 20,
    lineHeight: 25,

    fontWeight: '700',

    letterSpacing: -0.4,

    color: '#151515',
  },
});