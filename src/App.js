import * as React from 'react';
import { Outlet } from 'react-router-dom';

import { Footer, Header, Section, RumpusQuillForm, RumpusQuill, AuthRoot, FontSettingsModal, ColorSettingsModal } from '@rumpushub/common-react';
import NotionConsoleButton from './buildshift/buttons/notion_console_button';
import LeaderboardButton from './buildshift/buttons/leaderboard_button';

export default function App() {

    console.log('rumpus React version:', React.version);

    return (
        <>
            <AuthRoot>
                <Header header_path={'/view/header'} navbarItemsEnd={ [<NotionConsoleButton />, <LeaderboardButton />] } />
                <div className='columns is-centered'>
                    <div className='column'></div>
                    <div className='column is-three-fifths'>
                        <FontSettingsModal preview={true} secondaryFont={true} />
                        <ColorSettingsModal />
                        <Outlet />
                    </div>
                    <div className='column'></div>
                </div>
                <Footer footer_path={"/view/footer"} />
            </AuthRoot>
        </>
    )
}