export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function interpolateColor(
  color1: string,
  color2: string,
  factor: number,
): string {
  const c1 = hexToComponents(color1);
  const c2 = hexToComponents(color2);
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToComponents(hex: string): {r: number; g: number; b: number} {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

export function getStatusColor(
  status: 'safe' | 'warning' | 'exceeded',
  isDark: boolean,
): string {
  const colors = {
    safe: isDark ? '#52B788' : '#2D6A4F',
    warning: isDark ? '#F59E0B' : '#B45309',
    exceeded: isDark ? '#EF4444' : '#B91C1C',
  };
  return colors[status];
}

export function getIntensityColor(
  count: number,
  maxCount: number,
  isDark: boolean,
): string {
  if (count === 0) {
    return isDark ? '#2E2E2E' : '#E5E5E3';
  }
  const intensity = Math.min(count / maxCount, 1);
  const baseColor = isDark ? '#52B788' : '#2D6A4F';
  return hexToRgba(baseColor, 0.2 + intensity * 0.8);
}
