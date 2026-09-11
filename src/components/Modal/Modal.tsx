import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Box, Text } from '../../theme';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'center' | 'bottom' | 'full';
  showCloseButton?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  /** Action bar pinned at the bottom (e.g. [Cancel, Save]). */
  footer?: React.ReactNode;
  /** If true, dismiss on tap outside (default true). */
  dismissOnBackdrop?: boolean;
}

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="m6 6 12 12M18 6 6 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function HeaderGrabber() {
  return (
    <Box alignItems="center" pt="xs" pb="xs">
      <View
        style={{
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#DFE4E7',
        }}
      />
    </Box>
  );
}

export function Modal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  variant = 'center',
  showCloseButton = true,
  contentStyle,
  scrollable = true,
  footer,
  dismissOnBackdrop = true,
}: ModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          entering={FadeIn.duration(200).easing(Easing.out(Easing.quad))}
          exiting={FadeOut.duration(140)}
          style={[
            styles.overlay,
            variant === 'bottom' ? styles.alignBottom : styles.alignCenter,
          ]}
        >
          {variant === 'bottom' ? (
            <Pressable
              style={styles.touchableArea}
              onPress={dismissOnBackdrop ? onClose : undefined}
              accessibilityLabel="Fechar"
            />
          ) : null}

          <Animated.View
            entering={
              variant === 'bottom'
                ? SlideInDown.duration(260).easing(Easing.out(Easing.cubic))
                : FadeIn.duration(200).easing(Easing.out(Easing.quad))
            }
            exiting={
              variant === 'bottom'
                ? SlideOutDown.duration(200)
                : FadeOut.duration(150)
            }
            style={[
              styles.content,
              variant === 'bottom' && {
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: 0,
                maxHeight: '94%',
              },
              variant === 'center' && styles.centerContent,
              variant === 'full' && {
                flex: 1,
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
              },
              contentStyle,
            ]}
          >
            {variant === 'bottom' ? <HeaderGrabber /> : null}

            {(title || subtitle || showCloseButton) ? (
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                px="lg"
                pt="md"
                pb="sm"
                style={
                  variant === 'bottom'
                    ? { borderBottomWidth: 0 }
                    : { borderBottomWidth: 1, borderColor: '#F0F3F4' }
                }
              >
                <Box flex={1} pr="sm">
                  {title ? (
                    <Text variant="h3" numberOfLines={1}>
                      {title}
                    </Text>
                  ) : null}
                  {subtitle ? (
                    <Text
                      variant="caption"
                      color="textSecondary"
                      mt="xxs"
                      numberOfLines={2}
                    >
                      {subtitle}
                    </Text>
                  ) : null}
                </Box>
                {showCloseButton ? (
                  <Pressable
                    onPress={onClose}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar"
                  >
                    {({ pressed }) => (
                      <Box
                        width={32}
                        height={32}
                        borderRadius="full"
                        bg="border"
                        alignItems="center"
                        justifyContent="center"
                        opacity={pressed ? 0.7 : 1}
                      >
                        <CloseIcon color="#171717" />
                      </Box>
                    )}
                  </Pressable>
                ) : null}
              </Box>
            ) : null}

            <Box
              flex={variant === 'full' ? 1 : undefined}
              style={footer ? { maxHeight: variant === 'full' ? undefined : 520 } : undefined}
            >
              {scrollable ? (
                <ScrollView
                  style={scrollStyle.scroll}
                  contentContainerStyle={[
                    scrollStyle.content,
                    footer ? { paddingBottom: 16 } : null,
                  ]}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>
              ) : (
                <Box px="lg" pt="md" pb={footer ? 'md' : 'lg'}>
                  {children}
                </Box>
              )}
            </Box>

            {footer ? (
              <View
                style={{
                  paddingHorizontal: 24,
                  paddingTop: 16,
                  paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
                  borderTopWidth: 1,
                  borderColor: '#DFE4E7',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {footer}
              </View>
            ) : variant === 'bottom' ? (
              <View
                style={{
                  paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
                }}
              />
            ) : null}
          </Animated.View>

          {variant !== 'bottom' ? (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={dismissOnBackdrop ? onClose : undefined}
              accessibilityLabel="Fechar"
            />
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  alignBottom: {
    justifyContent: 'flex-end',
  },
  alignCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableArea: {
    flex: 1,
  },
  content: {
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    borderRadius: 20,
    margin: 16,
    width: '92%',
    maxWidth: 440,
    maxHeight: '92%',
  },
});

const scrollStyle = StyleSheet.create({
  scroll: {
    maxHeight: 520,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
});
