import React, {useMemo} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Svg, {Rect, Text as SvgText, G} from 'react-native-svg';
import {useTheme} from '../theme';
import {WeeklyBarData} from '../types';
import {spacing, borderRadius} from '../theme/spacing';
import {typography} from '../theme/typography';

interface WeeklyChartProps {
  data: WeeklyBarData[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_PADDING = spacing.base * 2;
const CHART_HEIGHT = 160;
const BAR_VERTICAL_PADDING = 32;
const LABEL_HEIGHT = 20;

export const WeeklyChart: React.FC<WeeklyChartProps> = ({data}) => {
  const {colors} = useTheme();

  const chartWidth = SCREEN_WIDTH - CHART_PADDING * 2;
  const maxCount = useMemo(
    () => Math.max(...data.map(d => d.count), 1),
    [data],
  );
  const barAreaHeight = CHART_HEIGHT - LABEL_HEIGHT - BAR_VERTICAL_PADDING;
  const barWidth = Math.floor(
    (chartWidth - spacing.sm * (data.length - 1)) / data.length,
  );

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      <Text style={[styles.title, {color: colors.textPrimary}]}>
        Entries This Week
      </Text>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        {data.map((item, index) => {
          const barHeight = (item.count / maxCount) * barAreaHeight;
          const x = index * (barWidth + spacing.sm);
          const y = BAR_VERTICAL_PADDING + barAreaHeight - barHeight;

          return (
            <G key={item.date}>
              <Rect
                x={x}
                y={BAR_VERTICAL_PADDING}
                width={barWidth}
                height={barAreaHeight}
                rx={borderRadius.xs}
                fill={colors.border}
              />
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={borderRadius.xs}
                fill={colors.accent}
              />
              <SvgText
                x={x + barWidth / 2}
                y={CHART_HEIGHT - 4}
                textAnchor="middle"
                fontSize={typography.sizes.xs}
                fill={colors.textTertiary}>
                {item.label}
              </SvgText>
              {item.count > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={typography.sizes.xs}
                  fill={colors.accent}
                  fontWeight="bold">
                  {item.count}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.base,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
  },
});
