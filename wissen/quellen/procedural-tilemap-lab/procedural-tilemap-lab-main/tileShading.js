export const SCENE_LIGHT = Object.freeze({ x: -0.64, y: -0.77 });

export function cssRgb(rgb, alpha = 1) {
  return `rgba(${Math.round(clamp(rgb[0], 0, 255))},${Math.round(clamp(rgb[1], 0, 255))},${Math.round(clamp(rgb[2], 0, 255))},${alpha})`;
}

export function mixRgb(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export function toneRamp(base, options = {}) {
  return {
    base,
    light: mixRgb(base, options.light ?? [226, 222, 199], options.lightMix ?? 0.5),
    shadow: mixRgb(base, options.shadow ?? [25, 29, 24], options.shadowMix ?? 0.58),
    core: mixRgb(base, options.core ?? [10, 14, 12], options.coreMix ?? 0.8),
    rim: mixRgb(base, options.rim ?? [242, 238, 214], options.rimMix ?? 0.68),
    bounce: mixRgb(base, options.bounce ?? [138, 115, 75], options.bounceMix ?? 0.32),
  };
}

export function ellipseLitAt(shape, px, py, light = SCENE_LIGHT) {
  const nx = (px - shape.x) / Math.max(1, shape.rx);
  const ny = (py - shape.y) / Math.max(1, shape.ry);
  const len = Math.hypot(nx, ny) || 1;
  const dot = (nx / len) * light.x + (ny / len) * light.y;
  return clamp(0.5 + dot * 0.5, 0, 1);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
