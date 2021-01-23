import React from 'react';
import styled from 'styled-components';
import { Logo } from './logo'
import '../../../App.css';
import { font, color } from '../../../styles/theme';
import {
  Link
} from "react-router-dom";
import { DbSync } from '../db-sync'

const Head = styled.nav`
    display: flex;
    flex-direction: row;
    background-color: ${color.headerBackground};
    color: ${color.headerColor};
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

const Menu = styled.ul`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;  
`;
const MenuItem = styled.li`
    margin: 0 1.5rem;
    ${font.h3()}
`;

const SyncWarning = styled.div`
    margin-left: auto;
`

export const Header = () =>{
    return(
        <>            
            <Head>                
                <LogoBox>
                    <LinkLogo to="/">
                        <LogoImg/>
                        TASKER
                    </LinkLogo>
                 </LogoBox>
                <Menu>                        
                    <MenuItem>
                        <Link to="/tasks">Tareas</Link>
                    </MenuItem>
                    <MenuItem>
                        <Link to="/worklogs">Partes</Link>
                    </MenuItem>
                    <MenuItem>
                        <Link to="/settings">Settings</Link>
                    </MenuItem>       
                    <MenuItem>
                        <Link to="/about">About</Link>
                    </MenuItem>                    
                </Menu>
                <SyncWarning><DbSync /></SyncWarning>       
            </Head>
        </>
    );
}