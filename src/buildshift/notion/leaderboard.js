import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    LOGGER,
    ApiPersistence
} from "@rumpushub/common-react";
import { parseLeaderboardData } from "./utils";
import CounterSessionChart from "../analytics/counter_session_chart";

/**
 * Leaderboard component
 * Fetches leaderboard data via ApiPersistence, computes rates,
 * and renders a sorted, expandable leaderboard with infinite scroll.
 */
export default function Leaderboard() {
    const [allEntries, setAllEntries] = useState([]);
    const [visibleEntries, setVisibleEntries] = useState([]);
    const [page, setPage] = useState(1);
    const loaderRef = useRef(null);
    const PAGE_SIZE = 10;

    // Create persistence instance for the leaderboard API
    const leaderboardPersistence = ApiPersistence(
        "/notion-api/integrations/notion/consoleIntegration/database"
    );

    /**
     * Compute rate based on count and duration
     * Returns an object with value and unit string
     */
    const calculateRate = (count, durationSec) => {
        if (durationSec <= 0) return { value: 0, unit: "units/sec" };
        if (durationSec < 60) return { value: count / durationSec, unit: "units/sec" };
        if (durationSec < 3600) return { value: count / (durationSec / 60), unit: "units/min" };
        return { value: count / (durationSec / 3600), unit: "units/hr" };
    };

    // Fetch leaderboard entries on mount
    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const data = await leaderboardPersistence.getAll({
                    params: { name: "leaderboard" }
                });

                const parsed = parseLeaderboardData(data).map((entry) => {
                    const { value, unit } = calculateRate(entry.count, entry.duration);
                    return { ...entry, rateValue: value, rateUnit: unit };
                });

                setAllEntries(parsed);
                setVisibleEntries(parsed.slice(0, PAGE_SIZE));
            } catch (err) {
                // Detailed logging of errors
                LOGGER.group("Leaderboard fetch error");
                LOGGER.error("Raw error object:", err);
                if (err) {
                    LOGGER.error("err.message:", err.message);
                    LOGGER.error("err.name:", err.name);
                    LOGGER.error("err.stack:", err.stack);
                    LOGGER.error("err.response:", err.response);
                    if (err.response) {
                        LOGGER.error("err.response.status:", err.response.status);
                        LOGGER.error("err.response.data:", err.response.data);
                    }
                } else {
                    LOGGER.error("err is undefined or null");
                }
                LOGGER.groupEnd();
            }
        }

        fetchLeaderboard();
    }, []);

    // Infinite scroll logic
    const loadMore = useCallback(() => {
        setPage((prev) => {
            const nextPage = prev + 1;
            setVisibleEntries(allEntries.slice(0, nextPage * PAGE_SIZE));
            return nextPage;
        });
    }, [allEntries]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { threshold: 1.0 }
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [loadMore]);

    const [expandedId, setExpandedId] = useState(null);
    const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

    /**
     * Returns styles for leaderboard entry based on rank
     * Top 3 entries have unique styling, others fade
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
        else style.backgroundColor = "#b0e0e6"; // Pale blue

        // Fade effect starting from 4th entry
        if (idx >= 3) style.opacity = Math.max(0.3, 1 - (idx - 3) * 0.15);

        // Scale padding for top 3
        style.padding = idx === 0 ? "1.2rem 1rem" :
            idx === 1 ? "1.1rem 1rem" :
                idx === 2 ? "1rem 1rem" : "0.8rem 1rem";

        return style;
    };

    const getFontSize = (idx) => {
        if (idx === 0) return { rank: "1.5rem", name: "1.3rem" };
        if (idx === 1) return { rank: "1.3rem", name: "1.15rem" };
        if (idx === 2) return { rank: "1.2rem", name: "1.1rem" };
        return { rank: "1rem", name: "1rem" };
    };

    // Sort by rate by default
    const sortedEntries = [...visibleEntries].sort((a, b) => b.rateValue - a.rateValue);

    return (
        <div className="section" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h1 className="title">Leaderboard</h1>

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
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <span style={{ fontSize: fontSizes.rank }}>{idx + 1}.</span>
                                <span style={{ fontSize: fontSizes.name }}>{entry.user}</span>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div>Count: {entry.count}</div>
                                <div>Rate: {entry.rateValue.toFixed(2)} {entry.rateUnit}</div>
                            </div>
                        </div>

                        {isExpanded && (
                            <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                                <div>Start: {entry.startTimestamp || "—"}</div>
                                <div>End: {entry.endTimestamp || "—"}</div>
                                {entry.notes && <div>Notes: {entry.notes}</div>}

                                {/* Embed CounterSessionChart for this user */}
                                <span>All User Data:</span>
                                <div style={{ marginTop: "1rem" }}>
                                    <CounterSessionChart
                                        apiUrl="http://localhost:8000/api/rumpshift-analytics/counter-session-data/"
                                        defaultViewMode="individual_user"
                                        showControls={false}       // hide the controls in dropdown
                                        defaultUser={entry.user}   // pass the user dynamically
                                        backgroundColor="white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Infinite scroll loader sentinel */}
            <div ref={loaderRef} style={{ height: "40px" }} />
        </div>
    );
}
