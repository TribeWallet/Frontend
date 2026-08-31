import {StyleSheet} from 'react-native';
import {colors} from '../../config/theme';

export const styles = StyleSheet.create({
  card: {
    width: '100%',

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.cardBorder,

    borderRadius: 11,

    paddingHorizontal: 10,
    paddingTop: 11,
    paddingBottom: 9,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.025,
    shadowRadius: 3,

    elevation: 1,
  },
});