// 아장 브랜드 컬러: 따뜻한 코랄 + 크림
export const brand = {
  primary: '#FF7A6B',
  primaryDark: '#E85D4E',
  cream: '#FFF8F2',
  ink: '#2B2B2B',
  sub: '#8A8A8A',
  line: '#EFE7E1',
  white: '#FFFFFF',
};

const tintColorLight = brand.primary;

export default {
  light: {
    text: brand.ink,
    background: brand.white,
    tint: tintColorLight,
    tabIconDefault: '#C9C2BC',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: brand.ink,
    background: brand.white,
    tint: tintColorLight,
    tabIconDefault: '#C9C2BC',
    tabIconSelected: tintColorLight,
  },
};
