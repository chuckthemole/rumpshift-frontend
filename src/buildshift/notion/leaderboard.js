import React, { useState, useEffect } from "react";
import { getApi, LOGGER } from "@rumpushub/common-react";
import { parseLeaderboardData } from "./utils";

/**
 * Leaderboard component
 * Fetches leaderboard data from Notion API, computes rates, and renders
 * a sorted, expandable leaderboard with top 3 visually emphasized.
 */
export default function Leaderboard() {
    const [allEntries, setAllEntries] = useState([]);
    const [sortBy, setSortBy] = useState("rate"); // Default sort
    const [expandedId, setExpandedId] = useState(null); // Track expanded entry

    /**
     * Compute rate based on count and duration
     * Returns value and unit string
     */
    const calculateRate = (count, durationSec) => {
        if (durationSec <= 0) return { value: 0, unit: "units/sec" };
        if (durationSec < 60) return { value: count / durationSec, unit: "units/sec" };
        if (durationSec < 3600) return { value: count / (durationSec / 60), unit: "units/min" };
        return { value: count / (durationSec / 3600), unit: "units/hr" };
    };

    // Fetch leaderboard data on mount
    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const api = getApi();
                const { data } = await api.get(
                    "/notion-api/integrations/notion/consoleIntegration/database/264cee7d24dc81b7b071e37ae2576148"
                );

                const parsed = parseLeaderboardData(data).map((entry) => {
                    const { value, unit } = calculateRate(entry.count, entry.duration);
                    return {
                        ...entry,
                        rateValue: value,
                        rateUnit: unit,
                    };
                });

                setAllEntries(parsed);
            } catch (err) {
                LOGGER.error("Failed to fetch leaderboard:", err);
                setAllEntries([]);
            }
        }

        fetchLeaderboard();
    }, []);

    // Sort entries based on selected criteria
    const sortedEntries = [...allEntries].sort((a, b) => {
        if (sortBy === "count") return b.count - a.count;
        if (sortBy === "rate") return b.rateValue - a.rateValue;
        return 0;
    });

    /**
     * Returns styles for a leaderboard entry based on rank
     * - Top 3 have unique colors, larger padding, and font
     * - Entries beyond 3 fade gradually
     */
    const getRankStyle = (idx) => {
        const style = {
            fontWeight: idx < 3 ? "bold" : "normal",
            borderRadius: "8px",
            marginBottom: "0.5rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
        };

        // Top 3 colors
        if (idx === 0) style.backgroundColor = "#ffd700"; // Gold
        else if (idx === 1) style.backgroundColor = "#c0c0c0"; // Silver
        else if (idx === 2) style.backgroundColor = "#cd7f32"; // Bronze
        else style.backgroundColor = "#b0e0e6"; // Pale blue for others

        // Fade effect starting from 4th entry
        if (idx >= 3) {
            const fadeFactor = Math.max(0.3, 1 - (idx - 3) * 0.15); // Min opacity 0.3
            style.opacity = fadeFactor;
        }

        // Scale padding for first three
        if (idx === 0) style.padding = "1.2rem 1rem";
        else if (idx === 1) style.padding = "1.1rem 1rem";
        else if (idx === 2) style.padding = "1rem 1rem";
        else style.padding = "0.8rem 1rem"; // Standard for others

        return style;
    };

    /**
     * Returns font sizes for rank and username based on index
     */
    const getFontSize = (idx) => {
        if (idx === 0) return { rank: "1.5rem", name: "1.3rem" };
        if (idx === 1) return { rank: "1.3rem", name: "1.15rem" };
        if (idx === 2) return { rank: "1.2rem", name: "1.1rem" };
        return { rank: "1rem", name: "1rem" };
    };

    // Toggle expanded/collapsed state for details
    const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

    return (
        <div className="leaderboard-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
            {/* Sort selector */}
            <div className="mb-3" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <label>Sort by:</label>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input"
                >
                    <option value="count">Count (High → Low)</option>
                    <option value="rate">Rate (High → Low)</option>
                </select>
            </div>

            {/* Leaderboard list */}
            <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "0.5rem" }}>
                {sortedEntries.map((entry, idx) => {
                    const isExpanded = expandedId === entry.id;
                    const style = getRankStyle(idx);
                    const fontSizes = getFontSize(idx);

                    return (
                        <div
                            key={entry.id}
                            className="leaderboard-entry"
                            onClick={() => toggleExpand(entry.id)}
                            style={style}
                            title="Click to view more details"
                        >
                            {/* Rank, username, and metrics */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span style={{ fontSize: fontSizes.rank }}>{idx + 1}.</span>
                                    <span style={{ fontSize: fontSizes.name }}>{entry.user}</span>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div>Count: {entry.count}</div>
                                    <div>
                                        Rate: {entry.rateValue.toFixed(2)} {entry.rateUnit}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                                    <div>Start: {entry.startTimestamp || "—"}</div>
                                    <div>End: {entry.endTimestamp || "—"}</div>
                                    {entry.notes && <div>Notes: {entry.notes}</div>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
