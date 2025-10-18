import React, { useEffect, useState } from "react";
import {
    JsonEditor,
    LOGGER,
    ComponentLoading
} from "@rumpushub/common-react";
import { useMachine } from "./hooks/use_machine";

/**
 * MachineJsonEditor
 *
 * Displays and allows editing of a machine's wakeup_payload JSON data.
 * Uses JsonEditor to render and modify nested JSON.
 *
 * Features:
 * - Intelligent loading from machine data
 * - Save with minimum 1-second delay for UX
 * - Refresh button
 */
export default function MachineJsonEditor({ machine_id, title }) {
    const { machine, loading, error, refetch, updateWakeupPayload } = useMachine(machine_id);

    // Local state for JSON editor
    const [savedData, setSavedData] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    /**
     * Load wakeup_payload from machine data
     * Triggered whenever `machine` changes
     */
    useEffect(() => {
        if (!machine) {
            LOGGER.warn(`No machine found for ID: ${machine_id}`);
            return;
        }

        try {
            const payload = typeof machine.wakeup_payload === "string"
                ? JSON.parse(machine.wakeup_payload)
                : machine.wakeup_payload || {};

            setSavedData(payload);
            setHasChanges(false);
            LOGGER.debug(`[MachineJsonEditor] Loaded wakeup_payload for ${machine_id}:`, payload);
        } catch (err) {
            LOGGER.error(`[MachineJsonEditor] Failed to parse wakeup_payload JSON for ${machine_id}:`, err);
        }
    }, [machine, machine_id]);

    /**
     * Handles saving JSON data to backend
     * Ensures a minimum 1-second delay for the saving indicator
     */
    const handleSave = async (newData) => {
        if (!newData || typeof newData !== "object") {
            LOGGER.error(`[MachineJsonEditor] handleSave received invalid data for ${machine_id}`);
            return;
        }

        setSaving(true);
        setHasChanges(false);

        const startTime = Date.now();

        try {
            LOGGER.debug(`[MachineJsonEditor] Saving wakeup_payload for ${machine_id}:`, newData);
            await updateWakeupPayload(newData);
            setSavedData(newData);

            // Refresh machine to confirm update
            await refetch();

            LOGGER.info(`[MachineJsonEditor] Successfully saved wakeup_payload for ${machine_id}`);
        } catch (err) {
            LOGGER.error(`[MachineJsonEditor] Failed to save wakeup_payload for ${machine_id}:`, err);
            setHasChanges(true); // allow retry
        } finally {
            // Ensure minimum 1-second saving indicator
            const elapsed = Date.now() - startTime;
            const remaining = 1000 - elapsed;
            setTimeout(() => setSaving(false), remaining > 0 ? remaining : 0);
        }
    };

    // -----------------------
    // Render states
    // -----------------------

    if (loading) {
        return (
            <div className="p-6 has-text-grey-light">
                <ComponentLoading />
                <p>Loading machine data...</p>
            </div>
        );
    }

    if (error) {
        LOGGER.error(`[MachineJsonEditor] Error loading machine ${machine_id}:`, error);
        return (
            <div className="p-6 notification is-danger is-light">
                <p>Error loading machine: {error.toString()}</p>
                <button className="button is-info mt-4" onClick={refetch}>Retry</button>
            </div>
        );
    }

    if (!machine) {
        return (
            <div className="p-6 has-text-grey-light">
                <p>No machine found for ID: {machine_id}</p>
            </div>
        );
    }

    // -----------------------
    // Main editor UI
    // -----------------------
    return (
        <div className="p-6 box has-background-grey-lighter has-text-black">
            {/* Header with machine info and refresh */}
            <div className="level mb-4">
                <div className="level-left">
                    <h1 className="title is-4 has-text-black">
                        Machine: {machine.alias || machine.ip}
                    </h1>
                </div>
                <div className="level-right">
                    <button
                        className="button is-info"
                        onClick={refetch}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Refresh"}
                    </button>
                </div>
            </div>

            {/* JSON Editor */}
            <JsonEditor
                data={savedData}
                title={title}
                onChange={(newData) => {
                    setSavedData(newData);
                    setHasChanges(true);
                }}
                onSave={handleSave}
            />

            {/* Status messages */}
            {hasChanges && !saving && (
                <p className="has-text-warning mt-2 is-italic">
                    Unsaved changes detected
                </p>
            )}
            {saving && (
                <p className="has-text-info mt-2 is-italic">
                    Saving changes to backend...
                </p>
            )}
        </div>
    );
}
