import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import {
    Footer,
    Header,
    Section,
    RumpusQuillForm,
    RumpusQuill,
    AuthRoot,
    useColorSettings
} from '@rumpushub/common-react';

import NotionConsoleButton from './buildshift/buttons/notion_console_button';
import LeaderboardButton from './buildshift/buttons/leaderboard_button';

export default function App() {
    const { initColors } = useColorSettings();

    useEffect(() => {
        initColors();
    }, []);

    return (
        <div className="app-container">
            <AuthRoot className="app-inner">
                <Header
                    header_path={'/view_bs/header'}
                    // navbarItemsEnd={[<NotionConsoleButton />, <LeaderboardButton />]}
                />

                <main className="app-content columns is-centered">
                    <div className='column'></div>
                    <div className='column is-three-fifths'>
                        <Outlet />
                    </div>
                    <div className='column'></div>
                </main>

                <Footer footer_path={"/view/footer"} />
            </AuthRoot>
        </div>
    );
}
