const React = require('react');
const ReactDOM = require('react-dom/client');

import Home from './tab_home';
import FlavorPumpDashboard from './flavor_pump';
import MachineTaskManager from './machine_task_manager';
import { AdminSiteSettingsDashboard, EntityTaskManager } from '@rumpushub/common-react';

export default function Tabs() {

    const is_active = 'is-active';

    const [homeActive, setHomeActive] = React.useState(true);
    const [dashboardActive, setDashboardActive] = React.useState(false);
    const [machineTaskManagerActive, setMachineTaskManagerActive] = React.useState(false);
    const [settingsActive, setSettingsActive] = React.useState(false);

    const [activeWindow, setActiveWindow] = React.useState(<Home />);

    function clear() {
        setHomeActive(false);
        setDashboardActive(false);
        setMachineTaskManagerActive(false);
        setSettingsActive(false);
    }

    return (
        <>
            <div className="tabs is-boxed">
                <ul>
                    <li className={homeActive ? 'is-active' : ''}>
                        <a onClick={() => { clear(); setHomeActive(true); setActiveWindow(<Home />); }}>
                            <span>Home</span>
                        </a>
                    </li>
                    <li className={dashboardActive ? 'is-active' : ''}>
                        <a onClick={() => { clear(); setDashboardActive(true); setActiveWindow(<FlavorPumpDashboard />); }}>
                            <span>Flavor Pump</span>
                        </a>
                    </li>
                    <li className={machineTaskManagerActive ? 'is-active' : ''}>
                        <a onClick={() => { clear(); setMachineTaskManagerActive(true); setActiveWindow(<EntityTaskManager />); }}>
                            <span>Machine Task Manager</span>
                        </a>
                    </li>
                    <li className={settingsActive ? 'is-active' : ''}>
                        <a onClick={() => { clear(); setSettingsActive(true); setActiveWindow(<AdminSiteSettingsDashboard />); }}>
                            <span>Site Settings</span>
                        </a>
                    </li>
                </ul>
            </div>
            <div className='is-centered has-background-light box'>{activeWindow}</div>
        </>
    )
}
