import React from 'react'
import styled from 'styled-components'
import { Logo } from '../components/common/logo'
import '../../App.css';
import { font, color } from '../../styles/theme';
import {
  Link
} from "react-router-dom";

import { LoadDB } from '../components/loaddb.component'


const Head = styled.nav`
    display: flex;
    flex-direction: row;
    background-color: ${color.orange};
    padding: 0.5rem 1.5rem;
`;
const LinkLogo = styled(Link)`
    display: flex;
    align-items: center;
`;

const LogoBox = styled.div`
    display: flex;
    align-items: center;
    ${font.h1()}
`;

const LogoImg = styled(Logo)`
    width: 40px;
    height: 40px;
    color: #fff;
    margin-right: 1.5rem;
`

export const SetupApp = ( props ) => {
    return (
        <>
            <Head>                
                <LogoBox>
                    <LinkLogo to="/">
                        <LogoImg/>
                        Tasker Setup
                    </LinkLogo>
                 </LogoBox>                
            </Head>
            <LoadDB />
        </>
    )
}


