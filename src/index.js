import "./setupEnv";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
// import Users, { delete_user, loader as usersLoader } from './user/users';
// import User, { loader as userLoader } from './user/user';
// import Admin from "./admin/admin";
import '@rumpushub/common-react/dist/index.css';
import { ErrorPage, Logout } from '@rumpushub/common-react';

import Tabs from './dashboards/tabs';
import NotionTasks from "./buildshift/notion/notion_tasks";
import LandingPageBody from './buildshift/landing';
import Leaderboard from "./buildshift/notion/leaderboard";
import BugReportForm from "./buildshift/bug_report_form";

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: 'error',
                element: <h1>Something went wrong! </h1>,
            },
            {
                index: true, // default child for "/"
                element: <LandingPageBody />,
                // loader: landingLoader,
                errorElement: <ErrorPage />
            },
            {
                path: 'admin',
                element: <Tabs />,
                errorElement: <ErrorPage />,
            },
            {
                path: 'notion_console',
                element: <NotionTasks />,
                errorElement: <ErrorPage />,
            },
            {
                path: 'notion_leader',
                element: <Leaderboard />,
                errorElement: <ErrorPage />,
            },
            {
                path: 'bug_report',
                element: <BugReportForm />,
                errorElement: <ErrorPage />,
            },
            {
                path: 'logout',
                element: <Logout />,
            },
            {
                path: 'deleteUser/:username',
                // element: <Users />,
                action: async ({ request, params }) => {
                    // console.log(params);
                    // console.log(request.formData());
                    // console.log(request.url);
                    delete_user(params.username);
                    return request;
                },
                // loader: usersLoader,
                // errorElement: <ErrorPage />
            }
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);