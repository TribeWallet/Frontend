import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Polyline,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import { Box, Text } from '../../../../theme';

const COLORS = ['#0071DF', '#16AF7E', '#E8A924', '#6E5BEF', '#EF5067'];

export interface ChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartDatum[];
  height?: number;
  formatter?: (value: number) => string;
}

export function BarChart({ data, height = 160, formatter }: BarChartProps) {
  if (!data.length) {
    return (
      <Box alignItems="center" py="md">
        <Text variant="caption" color="textSecondary">
          Sem dados suficientes.
        </Text>
      </Box>
    );
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  const padding = { left: 36, right: 12, top: 8, bottom: 28 };
  const width = 320;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const barWidth = (innerW / data.length) * 0.55;
  const step = innerW / data.length;

  const ticks = 4;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) => (max / ticks) * i);

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {tickValues.map((tick, i) => {
          const y = padding.top + innerH - (tick / max) * innerH;
          return (
            <G key={i}>
              <Line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#DFE4E7"
                strokeDasharray="3,4"
                strokeWidth={0.7}
              />
              <SvgText
                x={padding.left - 6}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill="#8C949B"
              >
                {formatter ? formatter(tick) : Math.round(tick).toString()}
              </SvgText>
            </G>
          );
        })}
        {data.map((item, index) => {
          const h = Math.max(2, (item.value / max) * innerH);
          const x = padding.left + step * index + (step - barWidth) / 2;
          const y = padding.top + innerH - h;
          return (
            <G key={item.label}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={6}
                fill={COLORS[index % COLORS.length]}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                fontSize={10}
                fill="#6D7379"
              >
                {truncate(item.label, 12)}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

interface DonutChartProps {
  data: ChartDatum[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  size = 180,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0 || !data.length) {
    return (
      <Box alignItems="center" py="md">
        <Text variant="caption" color="textSecondary">
          Sem dados para exibir.
        </Text>
      </Box>
    );
  }
  const radius = size / 2;
  const stroke = 22;
  const inner = radius - stroke;
  const cx = radius;
  const cy = radius;
  const circumference = 2 * Math.PI * inner;

  let offset = 0;
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={inner}
            stroke="#DFE4E7"
            strokeWidth={stroke}
            fill="none"
          />
          {data.map((item, index) => {
            const fraction = item.value / total;
            const length = circumference * fraction;
            const dashArray = `${length} ${circumference - length}`;
            const node = (
              <Circle
                key={item.label}
                cx={cx}
                cy={cy}
                r={inner}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={stroke}
                strokeDasharray={dashArray}
                strokeDashoffset={-offset}
                fill="none"
                strokeLinecap="butt"
              />
            );
            offset += length;
            return node;
          })}
        </G>
        {centerValue ? (
          <SvgText
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            fontSize={18}
            fontWeight="700"
            fill="#171717"
          >
            {centerValue}
          </SvgText>
        ) : null}
        {centerLabel ? (
          <SvgText
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            fontSize={10}
            fill="#6D7379"
          >
            {centerLabel}
          </SvgText>
        ) : null}
      </Svg>
      <Box mt="sm" gap="xs" width="100%">
        {data.map((item, index) => (
          <Box key={item.label} flexDirection="row" alignItems="center" gap="xs">
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: COLORS[index % COLORS.length],
              }}
            />
            <Box flex={1}>
              <Text variant="captionStrong" color="text">
                {item.label}
              </Text>
            </Box>
            <Text variant="captionStrong" color="textSecondary">
              {((item.value / total) * 100).toFixed(0)}%
            </Text>
          </Box>
        ))}
      </Box>
    </View>
  );
}

interface LineChartProps {
  data: ChartDatum[];
  height?: number;
  formatter?: (value: number) => string;
}

export function LineChart({ data, height = 160, formatter }: LineChartProps) {
  if (!data.length) {
    return (
      <Box alignItems="center" py="md">
        <Text variant="caption" color="textSecondary">
          Sem dados suficientes.
        </Text>
      </Box>
    );
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const padding = { left: 36, right: 12, top: 12, bottom: 28 };
  const width = 320;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const range = max - min || 1;
  const step = innerW / Math.max(1, data.length - 1);

  const points = data.map((item, index) => {
    const x = padding.left + step * index;
    const y = padding.top + innerH - ((item.value - min) / range) * innerH;
    return { x, y, item };
  });

  const linePath = points
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(' ');

  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + innerH} L${points[0].x},${padding.top + innerH} Z`;

  const ticks = 4;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) => min + (range / ticks) * i);

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {tickValues.map((tick, i) => {
          const y = padding.top + innerH - ((tick - min) / range) * innerH;
          return (
            <G key={i}>
              <Line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#DFE4E7"
                strokeDasharray="3,4"
                strokeWidth={0.7}
              />
              <SvgText
                x={padding.left - 6}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill="#8C949B"
              >
                {formatter ? formatter(tick) : Math.round(tick).toString()}
              </SvgText>
            </G>
          );
        })}
        <Path d={areaPath} fill="#E8F1FF" opacity={0.6} />
        <Path d={linePath} stroke="#0071DF" strokeWidth={2.4} fill="none" />
        {points.map((p, i) => (
          <G key={i}>
            <Circle cx={p.x} cy={p.y} r={3.5} fill="#FFFFFF" stroke="#0071DF" strokeWidth={2} />
            <SvgText
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              fontSize={10}
              fill="#6D7379"
            >
              {truncate(p.item.label, 12)}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
}

interface HorizontalBarListProps {
  data: ChartDatum[];
  formatter?: (value: number) => string;
}

export function HorizontalBarList({ data, formatter }: HorizontalBarListProps) {
  if (!data.length) {
    return (
      <Box alignItems="center" py="md">
        <Text variant="caption" color="textSecondary">
          Sem dados suficientes.
        </Text>
      </Box>
    );
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Box gap="sm">
      {data.map((item, index) => {
        const percent = (item.value / max) * 100;
        return (
          <Box key={item.label}>
            <Box flexDirection="row" justifyContent="space-between" mb="xxs">
              <Text variant="captionStrong" color="text">
                {item.label}
              </Text>
              <Text variant="captionStrong" color="textSecondary">
                {formatter ? formatter(item.value) : item.value.toString()}
              </Text>
            </Box>
            <View
              style={{
                height: 8,
                backgroundColor: '#F0F3F4',
                borderRadius: 9999,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${Math.max(2, percent)}%`,
                  height: '100%',
                  backgroundColor: COLORS[index % COLORS.length],
                  borderRadius: 9999,
                }}
              />
            </View>
          </Box>
        );
      })}
    </Box>
  );
}

interface TrendSparkProps {
  data: ChartDatum[];
}

export function TrendSpark({ data }: TrendSparkProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const step = width / (data.length - 1);
  const points = data.map((item, index) => {
    const x = step * index;
    const y = height - ((item.value - min) / range) * height;
    return `${x},${y}`;
  });
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Polyline
        points={points.join(' ')}
        fill="none"
        stroke="#0071DF"
        strokeWidth={1.6}
      />
    </Svg>
  );
}

function truncate(value: string, length: number): string {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}
