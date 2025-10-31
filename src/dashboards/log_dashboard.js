import React, { useState, useMemo } from "react";
import { SingleSelector, LOGGER } from "@rumpushub/common-react";
import Log from "../buildshift/log";

const logOptions = [
    { value: "system", label: "System Log" },
    { value: "error", label: "Error Log" },
    { value: "access", label: "Access Log" },
];

const MOCK_DB_IDS = {
    system: "264cee7d24dc81b7b071e37ae2576148",
    error: "264cee7d24dc81db8196000cbbc7828f",
    access: "mock-access-db-id",
};

export default function LogDashboard() {
    const [selectedLog, setSelectedLog] = useState(logOptions[0].value);

    // Build Notion endpoint dynamically based on selection
    const logEndpoint = useMemo(() => {
        if (!selectedLog) return null;

        const dbId = MOCK_DB_IDS[selectedLog];
        if (!dbId) {
            LOGGER.error(`[LogDashboard] No DB ID configured for log type: ${selectedLog}`);
            return null;
        }

        return `/api/notion/db/${dbId}`;
    }, [selectedLog]);

    const handleClearLog = () => {
        LOGGER.info(`[LogDashboard] Clearing selected log: ${selectedLog}`);
        setSelectedLog(null);
    };

    return (
        <div className="columns">
            {/* Sidebar selector */}
            <div className="column is-one-quarter p-3">
                <h2 className="title is-4">Select Log</h2>
                <SingleSelector
                    options={logOptions}
                    value={selectedLog}
                    onChange={setSelectedLog}
                    placeholder="Select a log..."
                    searchable={false}
                />
                <button
                    className="button is-danger mt-3"
                    onClick={handleClearLog}
                    disabled={!selectedLog}
                >
                    Clear Log
                </button>
            </div>

            {/* Main content: Log display */}
            <div className="column p-5">
                {selectedLog && logEndpoint ? (
                    <Log endpoint={logEndpoint} pageSize={15} />
                ) : (
                    <p className="has-text-grey">No log selected.</p>
                )}
            </div>
        </div>
    );
}
