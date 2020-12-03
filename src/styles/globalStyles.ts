import { createGlobalStyle } from 'styled-components'
import { reset } from './reset';
import { reboot } from './reboot';
import { font, color, common } from './theme';

export const GlobalStyle = createGlobalStyle`
    ${reset}
    ${reboot}
    body {
        min-height: 100vh;
        font-family: Arial, Helvetica, 'Open Sans', sans-serif;
        ${font.base()};        
        color: ${color.white};
    }
    h3.section-title{
        ${font.h3()}
        color: ${color.white};
        background-color: ${color.orange};
        ${common.roundedCornersTop()};
        padding: 1rem;
    }
    .block {
        margin: 1rem;
        border-style: solid;
        border-color: #000;
        border-width: 1px;
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
    }

    .block-content{
        margin: 1rem;
    }
`