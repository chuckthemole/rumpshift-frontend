import React, { useState } from "react";
import { JsonEditor, LOGGER } from "@rumpushub/common-react";

/**
 * PasteurizerDashboard displays and allows editing of pasteurizer JSON data.
 * Uses JsonEditor to render and modify nested JSON.
 */
export default function PasteurizerDashboard() {
    // Mock pasteurizer JSON data
    const initialData = {
        pasteurizer: {
            id: "PX-101",
            status: "idle", // idle, running, error
            temperature_current: 72,
            temperature_target: 75,
            temperature_unit: "°C",
            flowRate_current: 120, // liters per hour
            flowRate_target: 125,
            flowRate_unit: "L/h",
            alarms: [
                {
                    id: 1,
                    type: "temperature",
                    message: "Temperature exceeded safety limit",
                    active: false
                },
                {
                    id: 2,
                    type: "flow",
                    message: "Flow rate below minimum threshold",
                    active: false
                }
            ],
            lastMaintenance: "2025-09-30T14:00:00Z",
            operator_name: "John Doe",
            operator_shift: "morning"
        }
    };

    const [savedData, setSavedData] = useState(initialData ?? {});

    /**
     * Handles JSON save event from JsonEditor
     * @param {object} newData - Edited JSON from the editor
     */
    const handleSave = (newData) => {
        try {
            if (!newData || typeof newData !== "object") {
                throw new Error("handleSave received invalid JSON data");
            }
            LOGGER.debug("PasteurizerDashboard: Received saved JSON", newData);

            // Optional: Validate or sanitize newData here

            setSavedData(newData);
        } catch (err) {
            LOGGER.error("PasteurizerDashboard: Error saving JSON", err);
            throw err; // re-throw so errors surface in console or monitoring
        }
    };

    return (
        <div className="p-6 bg-gray-800 min-h-screen text-white">
            <h1 className="text-2xl font-bold mb-6">Pasteurizer Controller Dashboard</h1>
            <JsonEditor
                initialData={savedData ?? {}}
                onSave={handleSave}
            />
        </div>
    );
}
