import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal as RNModal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Box, Text } from '../../theme';

export interface SelectOption {
  id: string;
  label: string;
  description?: string;
  leading?: React.ReactNode;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onChange: (id: string) => void;
  error?: string;
  helperText?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Habilita busca dentro do sheet. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Texto curto exibido no header do sheet (ex: "Selecionar grupo"). */
  sheetTitle?: string;
}

function ChevronDown({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="m6 9 6 6 6-6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="m6 6 12 12M18 6 6 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={1.7} />
      <Path d="m20 20-3.5-3.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="m5 12.5 5 5L20 6.5"
        stroke="#0071DF"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Select({
  label: labelProp,
  placeholder = 'Selecione uma opção',
  value,
  options,
  onChange,
  error,
  helperText,
  emptyText = 'Nenhuma opção disponível',
  disabled,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  sheetTitle,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((option) => option.id === value);

  useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const needle = query.trim().toLowerCase();
    return options.filter((option) => {
      const lbl = option.label.toLowerCase();
      const desc = option.description?.toLowerCase() ?? '';
      return lbl.includes(needle) || desc.includes(needle);
    });
  }, [options, query, searchable]);

  const handleOpen = () => {
    if (!disabled) {
      setQuery('');
      setOpen(true);
    }
  };
  const handleClose = () => {
    setOpen(false);
    setQuery('');
  };
  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  // const displayLabel = sheetTitle ?? labelProp ?? 'Selecione';

  return (
    <Box>
      {labelProp ? (
        <Text variant="label" marginBottom="xs">
          {labelProp}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={labelProp ?? placeholder}
        accessibilityState={{ expanded: open, disabled: !!disabled }}
        onPress={handleOpen}
        hitSlop={4}
        disabled={disabled}
      >
        {({ pressed }) => (
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            bg="surface"
            borderRadius="md"
            borderWidth={1}
            borderColor={error ? 'danger' : open ? 'primary' : 'border'}
            px="md"
            minHeight={48}
            opacity={pressed ? 0.85 : disabled ? 0.6 : 1}
          >
            <Box flex={1} flexDirection="row" alignItems="center" gap="xs" pr="sm">
              {selected?.leading}
              <Text
                variant="input"
                numberOfLines={1}
                style={!selected ? { color: '#8C949B' } : undefined}
              >
                {selected ? selected.label : placeholder}
              </Text>
            </Box>
            <ChevronDown color={open ? '#0071DF' : '#6D7379'} />
          </Box>
        )}
      </Pressable>

      {(error || helperText) ? (
        <Text
          variant="caption"
          color={error ? 'danger' : 'textMuted'}
          marginTop="xs"
        >
          {error || helperText}
        </Text>
      ) : null}

      <RNModal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <View style={styles.fill} pointerEvents="box-none">
          <Animated.View
            entering={FadeIn.duration(160).easing(Easing.out(Easing.quad))}
            exiting={FadeOut.duration(140)}
            style={styles.backdropWrap}
            pointerEvents="auto"
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={handleClose}
              accessibilityLabel="Fechar seleção"
              accessibilityRole="button"
            />
          </Animated.View>

          <Animated.View
            entering={SlideInDown.duration(240).easing(
              Easing.out(Easing.cubic),
            )}
            exiting={SlideOutDown.duration(180)}
            style={[styles.sheet, sheetStyle]}
            pointerEvents="auto"
          >
            <Box alignItems="center" pt="xs" pb="xs">
              <View style={styles.grabber} />
            </Box>

            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              px="lg"
              pt="sm"
              pb="md"
            >
              <Box flex={1} pr="sm">
                <Text variant="h3" numberOfLines={1}>
                  {sheetTitle ?? labelProp ?? 'Selecione'}
                </Text>
                {options.length > 0 ? (
                  <Text variant="caption" color="textMuted">
                    {options.length}{' '}
                    {options.length === 1 ? 'opção' : 'opções'} disponíveis
                  </Text>
                ) : null}
              </Box>
              <Pressable
                onPress={handleClose}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Box
                  width={32}
                  height={32}
                  borderRadius="full"
                  bg="border"
                  alignItems="center"
                  justifyContent="center"
                >
                  <CloseIcon color="#171717" />
                </Box>
              </Pressable>
            </Box>

            {searchable ? (
              <Box px="lg" pb="sm">
                <Box
                  flexDirection="row"
                  alignItems="center"
                  gap="xs"
                  bg="background"
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="border"
                  px="md"
                  minHeight={44}
                >
                  <SearchIcon color="#8C949B" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={searchPlaceholder}
                    placeholderTextColor="#8C949B"
                    value={query}
                    onChangeText={setQuery}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                  />
                </Box>
              </Box>
            ) : null}

            <View style={styles.divider} />

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{ paddingBottom: 12 }}
              ListEmptyComponent={
                <Box py="xl" alignItems="center" gap="xs">
                  <Text variant="bodySmall" color="textSecondary">
                    {query ? 'Nenhum resultado encontrado.' : emptyText}
                  </Text>
                  {query ? (
                    <Pressable onPress={() => setQuery('')} hitSlop={6}>
                      <Text variant="captionStrong" color="primary">
                        Limpar busca
                      </Text>
                    </Pressable>
                  ) : null}
                </Box>
              }
              renderItem={({ item }) => {
                const active = item.id === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => handleSelect(item.id)}
                  >
                    {({ pressed }) => (
                      <Box
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        px="lg"
                        py="md"
                        bg={
                          active
                            ? 'primaryLight'
                            : pressed
                              ? 'background'
                              : 'surface'
                        }
                      >
                        <Box
                          flex={1}
                          flexDirection="row"
                          alignItems="center"
                          gap="sm"
                          pr="sm"
                        >
                          {item.leading}
                          <Box flex={1}>
                            <Text
                              variant="bodyStrong"
                              color={active ? 'primary' : 'text'}
                              numberOfLines={1}
                            >
                              {item.label}
                            </Text>
                            {item.description ? (
                              <Text
                                variant="caption"
                                color="textSecondary"
                                numberOfLines={1}
                                mt="xxs"
                              >
                                {item.description}
                              </Text>
                            ) : null}
                          </Box>
                        </Box>
                        {active ? <CheckIcon /> : null}
                      </Box>
                    )}
                  </Pressable>
                );
              }}
            />
          </Animated.View>
        </View>
      </RNModal>
    </Box>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  backdropWrap: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DFE4E7',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F3F4',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#171717',
    paddingVertical: 8,
  },
});

const sheetStyle = {
  paddingBottom: 0,
};
