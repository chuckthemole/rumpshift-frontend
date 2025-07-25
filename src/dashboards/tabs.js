const React = require('react');
const ReactDOM = require('react-dom/client');

import FlavorPump from './flavor_pump';
import Home from './tab_home';

export default function Tabs() {

    const is_active = 'is-active';

    const [homeActive, setHome] = React.useState(true);
    const [dashboardActive, setDashboard] = React.useState(false);
    // const [logsActive, setLogs] = React.useState(false);
    // const [serversActive, setServers] = React.useState(false);

    const [activeWindow, setActiveWindow] = React.useState(<Home />);

    function clear() {
        setHome(false);
        setDashboard(false);
        // setLogs(false);
        // setServers(false);
    }

    return (
        <>
            <div className="tabs is-boxed">
                <ul>
                    <li className={`homeTab ${homeActive && is_active}`}>
                        <a onClick={ ()=> { clear(); setHome(true); setActiveWindow(<Home />); } }>
                            <span>Home</span>
                        </a>
                    </li>
                    <li className={`dashboardTab ${dashboardActive && is_active}`}>
                        <a onClick={ ()=> { clear(); setDashboard(true); setActiveWindow(<FlavorPump />); } }>
                            <span>Flavor Pump</span>
                        </a>
                    </li>
                    {/* <li className={`usersTab ${usersActive && is_active}`}>
                        <a onClick={ ()=> { clear(); setUsers(true); setActiveWindow(<Users />); } }>
                            <span>Users</span>
                        </a>
                    </li>
                    <li className={`logsTab ${logsActive && is_active}`}>
                        <a onClick={ ()=> { clear(); setLogs(true); setActiveWindow(<Log log_identifier={'ADMIN_LOG'}/>); } }>
                            <span>Logs</span>
                        </a>
                    </li>
                    <li className={`serversTab ${serversActive && is_active}`}>
                        <a onClick={ ()=> { clear(); setServers(true); setActiveWindow(<Servers />); } }>
                            <span>Servers</span>
                        </a>
                    </li> */}
                </ul>
            </div>

            <div className='is-centered has-background-light box'>{activeWindow}</div>
        </>
    )
}