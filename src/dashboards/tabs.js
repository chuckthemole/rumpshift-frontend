import React, { useState } from "react";
import Home from "./tab_home";
import FlavorPumpDashboard from "./flavor_pump";
import PasteurizerDashboard from "./pasteurizer_dashboard";
import MachineDashboard from "./machine_dashboard";
import MachineTaskManager from "./machine_task_manager";
import LogDashboard from "./log_dashboard";
import {
    LOGGER,
    ApiPersistence,
    AdminSiteSettingsDashboard,
    EntityTaskManager,
} from "@rumpushub/common-react";
import CounterSessionChart, { SimplifiedLevel } from "../buildshift/analytics/counter_session_chart";
import ApiDocsSelector from "../buildshift/openapi/api_docs_selector";
import RecipeCalculator from "./recipe_calculator";

export default function Tabs() {
    // Define tabs as an array of objects to simplify state management
    const recipeInputFields = ["Run Date", "Cases", "Concentrate TDS"];
    const tabs = [
        { key: "home", label: "Home", component: <Home /> },

        {
            key: "machines",
            label: "Machines",
            component: (
                <MachineDashboard
                    persistence={
                        ApiPersistence(
                            "/api/arduino_consumer/arduino/get-machines/",
                            "RUMPSHIFT_API"
                        )}
                />
            ),
        },

        { key: "machineTaskManager", label: "Machine Task Manager", component: <MachineTaskManager /> },

        { key: "siteSettings", label: "Site Settings", component: <AdminSiteSettingsDashboard /> },

        {
            key: "analytics",
            label: "Analytics",
            component: (
                <CounterSessionChart
                    apiUrl="/api/rumpshift-analytics/counter-session-data/"
                    showControls={true}
                    simplifiedLevel={SimplifiedLevel.DETAILED}
                />
            ),
        },

        { key: "apis", label: "Apis", component: <ApiDocsSelector /> },

        { key: "logs", label: "Logs", component: <LogDashboard /> },

        {
            key: "recipeCalculator",
            label: "Recipe Calculator",
            component: (
                <RecipeCalculator
                    controllingInputs={
                        {
                            "Hayes Jammer": recipeInputFields,
                            "Soma Star": recipeInputFields,
                            "Good Boy ETH": recipeInputFields,
                            "Mission Freestyler": recipeInputFields
                        }
                    }
                />
            ),
        },
    ];

    const [activeTab, setActiveTab] = useState("home");

    const handleTabClick = (key) => {
        LOGGER.debug(`[Tabs] Switching to tab: ${key}`);
        setActiveTab(key);
    };

    const activeComponent = tabs.find((tab) => tab.key === activeTab)?.component;

    return (
        <>
            <div className="tabs is-boxed">
                <ul>
                    {tabs.map((tab) => (
                        <li key={tab.key} className={activeTab === tab.key ? "is-active" : ""}>
                            <a onClick={() => handleTabClick(tab.key)}>
                                <span>{tab.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="is-centered has-background-light box">
                {activeComponent}
            </div>
        </>
    );
}
