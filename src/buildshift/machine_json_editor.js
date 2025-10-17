import React, { useEffect, useState } from "react";
import { JsonEditor, LOGGER } from "@rumpushub/common-react";
import { useMachine } from "./hooks/use_machine";

/**
 * MachineJsonEditor
 *
 * Displays and allows editing of a machine's wakeup_payload JSON data.
 * Uses JsonEditor to render and modify nested JSON.
 */
export default function MachineJsonEditor({ machine_id, title }) {
    const { machine, loading, error, refetch, updateWakeupPayload } = useMachine(machine_id);
    const [savedData, setSavedData] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load wakeup_payload from machine data
    useEffect(() => {
        if (!machine) {
            LOGGER.warn(`No machine found for ID: ${machine_id}`);
            return;
        }

        try {
            if (machine?.wakeup_payload) {
                const payload =
                    typeof machine.wakeup_payload === "string"
                        ? JSON.parse(machine.wakeup_payload)
                        : machine.wakeup_payload;

                setSavedData(payload);
                setHasChanges(false);
                LOGGER.debug(`[MachineJsonEditor] Loaded wakeup_payload for ${machine_id}:`, payload);
            } else {
                LOGGER.warn(`[MachineJsonEditor] Machine ${machine_id} has no wakeup_payload`);
            }
        } catch (err) {
            LOGGER.error(`[MachineJsonEditor] Failed to parse wakeup_payload JSON for ${machine_id}:`, err);
        }
    }, [machine, machine_id]);

    /**
     * Handles JSON save event from JsonEditor
     */
    const handleSave = async (newData) => {
        LOGGER.debug(`[MachineJsonEditor] handleSave called for ${machine_id}`, newData);

        try {
            if (!newData || typeof newData !== "object") {
                throw new Error("handleSave received invalid JSON data");
            }

            setSaving(true);
            setHasChanges(false);

            // Stringify before sending (helps catch serialization bugs)
            const serializedPayload = JSON.stringify(newData);
            LOGGER.debug(`[MachineJsonEditor] Serialized wakeup_payload for ${machine_id}:`, serializedPayload);

            try {
                // Persist to backend
                await updateWakeupPayload(newData);
                LOGGER.info(`[MachineJsonEditor] Successfully updated wakeup_payload for ${machine_id}`);
                setSavedData(newData);

                // Verify with backend
                await refetch();
                LOGGER.debug(`[MachineJsonEditor] Refetched machine ${machine_id} to verify update.`);
            } catch (apiErr) {
                LOGGER.error(`[MachineJsonEditor] API updateWakeupPayload failed for ${machine_id}:`, apiErr);
                throw apiErr; // propagate for outer catch
            }
        } catch (err) {
            LOGGER.error(`[MachineJsonEditor] Error saving wakeup_payload for ${machine_id}:`, err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-gray-400">
                <p>Loading machine data...</p>
            </div>
        );
    }

    if (error) {
        LOGGER.error(`[MachineJsonEditor] Error loading machine ${machine_id}:`, error);
        return (
            <div className="p-6 text-red-400">
                <p>Error loading machine: {error.toString()}</p>
                <button
                    onClick={refetch}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!machine) {
        return (
            <div className="p-6 text-gray-400">
                <p>No machine found for ID: {machine_id}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-800 min-h-screen text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Machine: {machine.alias || machine.ip}
                </h1>
                <button
                    onClick={refetch}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Refresh"}
                </button>
            </div>

            <JsonEditor
                data={savedData}
                title={title}
                onChange={(newData) => {
                    setSavedData(newData);
                    setHasChanges(true);
                }}
                onSave={handleSave}
            />


            {hasChanges && (
                <p className="text-yellow-400 mt-2 italic">
                    Unsaved changes detected
                </p>
            )}

            {saving && (
                <p className="text-blue-400 mt-2 italic">
                    Saving changes to backend...
                </p>
            )}
        </div>
    );
}
