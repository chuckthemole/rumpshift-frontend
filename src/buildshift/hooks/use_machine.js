import { useEffect, useState, useCallback } from "react";
import { LOGGER, getNamedApi } from "@rumpushub/common-react";

/**
 * useMachine
 *
 * Fetches and optionally updates a machine's details.
 *
 * @param {string|number|null} machine_identifier - Machine IP or ID
 * @returns {{
 *   machine: object|null,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: Function,
 *   updateWakeupPayload: Function
 * }}
 */
export function useMachine(machine_identifier) {
    const get_machine_endpoint = "/api/arduino_consumer/arduino/get-machine";
    const wakeup_endpoint = "/api/arduino_consumer/arduino/wakeup";

    let api = null;
    try {
        api = getNamedApi("RUMPSHIFT_API");
    } catch (err) {
        LOGGER.error("[useMachine] Failed to initialize API client:", err);
    }

    const [machine, setMachine] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch machine data
     */
    const fetchMachine = useCallback(async () => {
        if (!machine_identifier) {
            LOGGER.warn("[useMachine] No machine_identifier provided — skipping fetch.");
            return;
        }

        if (!api) {
            LOGGER.error("[useMachine] API client is undefined. Did getNamedApi('RUMPSHIFT_API') fail?");
            setError("API client not initialized");
            return;
        }

        setLoading(true);
        setError(null);

        const endpoint = `${get_machine_endpoint}/${machine_identifier}/`;
        LOGGER.debug(`[useMachine] Fetching machine data from ${endpoint}`);

        try {
            const response = await api.get(endpoint);
            LOGGER.debug(`[useMachine] Response for ${machine_identifier}:`, response.data);

            if (!response?.data) {
                throw new Error("Empty response received from backend");
            }

            setMachine(response.data);
            LOGGER.info(`[useMachine] Successfully fetched machine ${machine_identifier}`);
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                err.message ||
                "Unknown error fetching machine";
            LOGGER.error(`[useMachine] Error fetching machine ${machine_identifier}:`, msg, err);
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [api, machine_identifier]);

    /**
     * Update machine wakeup_payload
     */
    const updateWakeupPayload = useCallback(
        async (payload) => {
            LOGGER.debug(`[useMachine] updateWakeupPayload called for ${machine_identifier}`, payload);

            if (!machine_identifier) {
                const msg = "updateWakeupPayload called without machine identifier";
                LOGGER.error("[useMachine] " + msg);
                throw new Error(msg);
            }

            if (!payload || typeof payload !== "object") {
                const msg = "updateWakeupPayload requires a valid JSON object";
                LOGGER.error("[useMachine] " + msg);
                throw new Error(msg);
            }

            if (!api) {
                const msg = "API client not initialized";
                LOGGER.error("[useMachine] " + msg);
                throw new Error(msg);
            }

            setLoading(true);
            setError(null);

            const endpoint = `${wakeup_endpoint}/${machine_identifier}/update`;
            LOGGER.debug(`[useMachine] Sending wakeup payload to ${endpoint}`);

            try {
                // Always wrap in { payload: ... }
                const wrappedPayload = { payload };
                const serialized = JSON.stringify(wrappedPayload);
                LOGGER.debug(`[useMachine] Wrapped payload for ${machine_identifier}:`, serialized);

                // Send wrapped payload
                const response = await api.post(endpoint, wrappedPayload);

                if (!response?.data) {
                    throw new Error("Empty response received after updateWakeupPayload");
                }

                LOGGER.info(`[useMachine] Wakeup payload updated successfully for ${machine_identifier}`, response.data);

                // Refresh machine data to confirm update
                await fetchMachine();

                return response.data;
            } catch (err) {
                const msg =
                    err.response?.data?.error ||
                    err.message ||
                    "Unknown error updating wakeup payload";
                LOGGER.error(`[useMachine] Error updating wakeup payload for ${machine_identifier}:`, msg, err);
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [api, machine_identifier, fetchMachine]
    );


    /**
     * Fetch when hook mounts or machine_identifier changes
     */
    useEffect(() => {
        LOGGER.debug("[useMachine] Hook initialized for:", machine_identifier);
        try {
            fetchMachine();
        } catch (err) {
            LOGGER.error(`[useMachine] Unexpected error in initial fetch for ${machine_identifier}:`, err);
        }
    }, [fetchMachine, machine_identifier]);

    return {
        machine,
        loading,
        error,
        refetch: fetchMachine,
        updateWakeupPayload,
    };
}
