export interface Theme { colors: any; barChars: any; }

export interface ThemeColors {
  bg: string;
  text: string;
  accent: string;
  warn: string;
  error: string;
}

export const themes: Record<string, ThemeColors> = {
  goat: {
    bg: 'black',
    text: '#E8F4E8',
    accent: '#4ADE80',
    warn: '#E8A84A',
    error: '#F87171'
  },
  cyber: {
    bg: '#0D0221',
    text: '#00FFCC',
    accent: '#FF00A0',
    warn: '#F2FF00',
    error: '#FF0055'
  },
  minimal: {
    bg: 'transparent',
    text: 'white',
    accent: 'gray',
    warn: 'yellow',
    error: 'red'
  }
};

export const goatTheme = {
  name: 'Goat',
  colors: {
    primary: '#EF9F27',
    secondary: '#1D9E75',
    success: '#1D9E75',
    warning: '#E24B4A',
    muted: '#555550',
    border: 'round'
  },
  barChars: { filled: '█', empty: '░' }
};
