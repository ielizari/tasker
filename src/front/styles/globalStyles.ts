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
    .icon-spin {
        -webkit-animation: icon-spin 1s infinite linear;
                animation: icon-spin 1s infinite linear;
      }
      
      @-webkit-keyframes icon-spin {
        0% {
          -webkit-transform: rotate(0deg);
                  transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(359deg);
                  transform: rotate(359deg);
        }
      }
      
      @keyframes icon-spin {
        0% {
          -webkit-transform: rotate(0deg);
                  transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(359deg);
                  transform: rotate(359deg);
        }
      }
    input[type=text], select, select-items {
        padding: 0.5rem;
        ${common.roundedCorners()}
        border-style: solid;
        border-width: 1px;
        border-color: ${color.grey};
        margin: 0;
    }
    div.form-item-error{
        color: ${color.lightRed};
    }

    .message-success{
        background-color: ${color.success};
        text-align: center;
        margin: 1.5rem;
        padding: 1rem;
    }
    .message-error{
        background-color: ${color.lightRed};
        text-align: center;
        margin: 1.5rem;
        padding: 1rem;
    }
    button{
        display: inline-flex;
        align-items: center;
        padding: 0.5rem;
        ${common.roundedCorners()} 
        text-align: center;
        border-style: none;
        ${font.h4()}
        cursor: pointer;
        transition: background-color .5s;
    }
    button:hover{
        background-color: ${color.darkGrey}
    }
    .button-icon{
             
    }   
    .form-button-submit .button-icon{
        color: ${color.success}
    }
    .form-button-cancel .button-icon{
        color: ${color.lightRed}
    }
    .form-button-reset .button-icon{        
        color: ${color.black};
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