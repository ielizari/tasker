import { css } from 'styled-components';
import { rem, rgba } from 'polished';

export const grid = {
  maxWidth: rem(1132),
};


export const size = {
  xtiny: rem(4),
  tiny: rem(8),
  small: rem(12),
  mini: rem(16),
  base: rem(24),
  medium: rem(32),
  large: rem(48),
  xlarge: rem(64),
  huge: rem(96),
};

const fontWeight = {
  light: 300,
  regular: 400,
  bold: 700,
  extraBold: 800,
};

export const font = {
  weight: fontWeight,

  small(weight = fontWeight.regular) {
    return css`
      font-family: 'Arial, Helvetica, sans-serif !important';
      font-size: ${rem(12.64)};
      line-height: ${rem(17)};
      font-weight: ${weight};
    `;
  },

  base(weight = fontWeight.regular) {
    return css`
      font-family: 'Arial, Helvetica, sans-serif !important';
      font-size: ${rem(16)};
      line-height: ${rem(22)};
      font-weight: ${weight};
    `;
  },

  h4(weight = fontWeight.regular) {
    return css`
      font-family: 'Arial, Helvetica, sans-serif !important';
      font-size: ${rem(18)};
      line-height: ${rem(25)};
      font-weight: ${weight};
    `;
  },

  h3(weight = fontWeight.regular) {
    return css`
      font-family: 'Arial, Helvetica, sans-serif !important';
      font-size: ${rem(25.63)};
      line-height: ${rem(35)};
      font-weight: ${weight};
    `;
  },

  h2(weight = fontWeight.regular) {
    return css`
      font-family: 'Arial, Helvetica, sans-serif !important';
      font-size: ${rem(36.41)};
      line-height: ${rem(50)};
      font-weight: ${weight};
    `;
  },

  h1(weight = fontWeight.regular) {
    return css`
      font-family: 'Arial, Helvetica, sans-serif !important';
      font-size: ${rem(41.83)};
      line-height: ${rem(50)};
      font-weight: ${weight};
    `;
  },
};

export const color = {
  purple: '#9933FF',
  lightRed: '#FF6666',
  lightBlue: '#00CCFF',
  lightGreen: '#00FF99',
  lightYellow: '#FFF9AA',
  lightGrey: '#f4f4f4',
  semiLightGrey: '#eaeaea',
  blue: '#4158D0',
  pink: '#C850C0',
  yellow: '#FFCC70',
  black: '#000000',
  grey: '#999999',
  darkGrey: '#9b9b9b',
  veryDarkGrey: '#585858',
  white: '#FFFFFF',
  orange: '#1d502f',
  bckOrange: '#ec9416',
  lightOrange: '#fba72f',
  darkOrange: '#b36c06',
  success: '#9aeb36',
  background: '#c8cad0',
  headerBackground: '#1d502f',
  headerColor: '#c8cad0',
  headerBorderColor: '#b4991c',
  blockBackground: '#fff',
  blockTitleBackground: '#1eb12f',
  blockTitleColor: '#e4e4e4',
  tableHeaderBackground: '#1a9380',
  tableHeaderColor: '#d8d9de',
  saveIconColor: '#c9e311'
};

const radius = {
  default: '5px 5px 5px 5px',
  top: '5px 5px 0 0',
  bottom: '0 0 5px 5px',
  left: '5px 0 0 5px',
  right: '0 5px 5px 0',
}
export const common = {
  radius: radius,

  roundedCorners(rd = radius.default){
    return css`
      -webkit-border-radius: ${rd};
      -moz-border-radius: ${rd};
      border-radius: ${rd};
    `
  },
  roundedCornersTop(rd = radius.top){
    return css`
      -webkit-border-radius: ${rd};
      -moz-border-radius: ${rd};
      border-radius: ${rd};
    `
  },
  roundedCornersBottom(rd = radius.bottom){
    return css`
      -webkit-border-radius: ${rd};
      -moz-border-radius: ${rd};
      border-radius: ${rd};
    `
  },
  roundedCornersRight(rd = radius.right){
    return css`
      -webkit-border-radius: ${rd};
      -moz-border-radius: ${rd};
      border-radius: ${rd};
    `
  },
  roundedCornersLeft(rd = radius.left){
    return css`
      -webkit-border-radius: ${rd};
      -moz-border-radius: ${rd};
      border-radius: ${rd};
    `
  },  
  blur(){
    return css`
      -webkit-filter: blur(10px);
      -moz-filter: blur(10px);
      -ms-filter: blur(10px);
      -o-filter: blur(10px);
      filter: blur(10px);
    `
  },
  shadow(x = '0', y = '0', blur = '16', spread = '1', color = rgba(0,0,0,0.75)){
    return css`
      -webkit-box-shadow: ${x}px ${y}px ${blur}px ${spread}px ${color};
      -moz-box-shadow: ${x}px ${y}px ${blur}px ${spread}px ${color};
      box-shadow: ${x}px ${y}px ${blur}px ${spread}px ${color};
    `
  },
  blockTitle(){
    return css`
      margin: 1rem;
      border-style: solid;
      border-color: #000;
      border-width: 1px;
      -webkit-border-radius: 5px;
      -moz-border-radius: 5px;
      border-radius: 5px;
    `
  },
  greenButton(){
    return css`
      background-color: #48b03d;
    `
  },
  blockTitleGradient(){
    return css`
      background-image: linear-gradient(to right, ${color.blockTitleBackground}, ${color.headerBackground})
    `
  }
}