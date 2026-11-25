import React, { useCallback, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { Input } from '../Input';
import { Button } from '../Button';
import { Box, PressableBox, useTheme } from '../../theme';
import { parseBRDate, formatBR } from '../../utils/date';
import { useTranslation } from '../../hooks/useTranslation';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  minDate?: string; // DD/MM/AAAA
  maxDate?: string; // DD/MM/AAAA
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
      <Line x1={16} y1={2} x2={16} y2={6} />
      <Line x1={8} y1={2} x2={8} y2={6} />
      <Line x1={3} y1={10} x2={21} y2={10} />
    </Svg>
  );
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'DD/MM/AAAA',
  error,
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const minParsed = minDate ? parseBRDate(minDate) : null;
  const maxParsed = maxDate ? parseBRDate(maxDate) : null;

  const parsedValue = parseBRDate(value);

  const handleDateChange = useCallback(
    (_event: any, selectedDate: Date | undefined) => {
      if (selectedDate) {
        onChange(formatBR(selectedDate));
      }
      setIsOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange('');
    setIsOpen(false);
  }, [onChange]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
  }, [disabled]);

  return (
    <Box>
      <Input
        label={label}
        value={value}
        onChangeText={() => {
          // Bloqueia digitação direta: a data só pode ser escolhida pelo date picker
        }}
        onBlur={() => {
          // Não valida no blur: só fecha o teclado, não há erro de formato
        }}
        placeholder={placeholder}
        keyboardType="numeric"
        maxLength={10}
        error={error}
        editable={false}
        rightIcon={
          disabled
            ? undefined
            : (
              <PressableBox
                hitSlop={12}
                onPress={handleOpen}
                accessibilityRole="button"
                accessibilityLabel={t('datePicker.openDatePicker')}
                px="md"
                py="xs"
              >
                <CalendarIcon color={theme.colors.textMuted} />
              </PressableBox>
            )
        }
      />

      {isOpen && (
        <DateTimePicker
          value={parsedValue ?? new Date()}
          minimumDate={minParsed ?? undefined}
          maximumDate={maxParsed ?? undefined}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          mode="date"
          onChange={handleDateChange}
          locale="pt-BR"
        />
      )}
    </Box>
  );
}

export default DatePicker;
