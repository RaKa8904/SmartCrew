// SmartCrew Aviation Dark Theme — matching the web app's aesthetic
export const colors = {
    background: '#0a0e1a',
    surface: '#111827',
    surfaceLight: '#1e293b',
    card: 'rgba(17, 24, 39, 0.85)',
    cardBorder: 'rgba(255, 255, 255, 0.06)',

    primary: '#0ea5e9',
    primaryGlow: 'rgba(14, 165, 233, 0.15)',
    primaryBorder: 'rgba(14, 165, 233, 0.3)',

    success: '#10b981',
    successGlow: 'rgba(16, 185, 129, 0.1)',
    warning: '#f59e0b',
    warningGlow: 'rgba(245, 158, 11, 0.1)',
    danger: '#ef4444',
    dangerGlow: 'rgba(239, 68, 68, 0.1)',

    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#475569',
    textDim: '#64748b',

    gradientStart: '#0f172a',
    gradientEnd: '#020617',
};

export const fonts = {
    regular: { fontSize: 14, color: colors.text },
    small: { fontSize: 12, color: colors.textSecondary },
    label: { fontSize: 10, color: colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700' },
    heading: { fontSize: 22, fontWeight: '800', color: colors.text },
    subheading: { fontSize: 16, fontWeight: '600', color: colors.text },
    code: { fontSize: 13, fontFamily: 'monospace', color: colors.primary },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};
