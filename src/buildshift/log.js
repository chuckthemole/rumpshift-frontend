import React, { useEffect, useState, useCallback } from "react";
import { LOGGER, getNamedApi, transformNotionRow } from "@rumpushub/common-react";

export default function Log({ endpoint, pageSize = 10 }) {
    const [logData, setLogData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize API client
    let api = null;
    try {
        api = getNamedApi("RUMPSHIFT_API");
    } catch (err) {
        LOGGER.error("[Log] Failed to initialize API client:", err);
    }

    const fetchLogData = useCallback(async () => {
        if (!endpoint) {
            LOGGER.warn("[Log] No endpoint provided — skipping fetch.");
            return;
        }

        if (!api) {
            const msg = "API client not initialized";
            LOGGER.error("[Log] " + msg);
            setError(msg);
            return;
        }

        setLoading(true);
        setError(null);
        LOGGER.debug(`[Log] Fetching log data from ${endpoint}`);

        try {
            const response = await api.get(endpoint);
            const rawData = response?.data?.results || response?.data;

            if (!rawData) {
                throw new Error("Empty response received from backend");
            }

            // Ensure we have an array
            const arrayData = Array.isArray(rawData) ? rawData : [rawData];

            // Transform each row for display
            const transformedData = arrayData.map(transformNotionRow);
            setLogData(transformedData);

            // Dynamically determine columns from first row
            if (transformedData.length > 0) {
                setColumns(Object.keys(transformedData[0]));
            } else {
                setColumns([]);
            }

            LOGGER.info(`[Log] Successfully fetched and transformed log data from ${endpoint}`, transformedData);
        } catch (err) {
            const msg = err.response?.data?.error || err.message || "Unknown error fetching log";
            LOGGER.error(`[Log] Error fetching log data from ${endpoint}:`, msg, err);
            setError(msg);
            setLogData([]);
            setColumns([]);
        } finally {
            setLoading(false);
        }
    }, [api, endpoint]);


    useEffect(() => {
        fetchLogData();
    }, [fetchLogData]);

    // Pagination
    const totalPages = Math.ceil(logData.length / pageSize);
    const paginatedData = logData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Helper to safely render values
    const renderCell = (value) => {
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return JSON.stringify(value, null, 2);
        return value;
    };

    if (loading) return <p>Loading log...</p>;
    if (error) return <p className="has-text-danger">{error}</p>;
    if (logData.length === 0) return <p>No log data available.</p>;

    return (
        <div>
            <table className="table is-striped is-fullwidth">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((entry, idx) => (
                        <tr key={idx}>
                            {columns.map((col) => (
                                <td key={col}>{renderCell(entry[col])}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination controls */}
            <div className="buttons mt-3">
                <button
                    className="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className="mx-2">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    className="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
