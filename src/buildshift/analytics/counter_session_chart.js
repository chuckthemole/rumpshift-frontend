import React, { useEffect, useState, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import {
    getNamedApi,
    LOGGER,
    ComponentLoading
} from "@rumpushub/common-react";

const CounterSessionChart = ({ apiUrl }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("default"); // default, user, date, user_date, raw
    const [focusMetric, setFocusMetric] = useState("both"); // "Count", "Duration", or "both"

    // -------------------------------
    // Fetch data from API whenever apiUrl or viewMode changes
    // -------------------------------
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const api = getNamedApi("RUMPSHIFT_API");
                const response = await api.get(apiUrl, { params: { view: viewMode, agg: "sum" } });
                LOGGER.info("API response data", response?.data);
                setData(response.data || []);
            } catch (error) {
                LOGGER.error("Error fetching counter session data:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [apiUrl, viewMode]);

    // -------------------------------
    // Prepare chart data: convert Duration to appropriate units (s/min/h)
    // -------------------------------
    const chartData = useMemo(() => {
        if (!data.length) return [];

        const maxDuration = Math.max(...data.map(d => d.Duration || 0));
        let durationFactor = 1;
        let durationLabel = "s";

        if (maxDuration > 3600) {
            durationFactor = 3600;
            durationLabel = "h";
        } else if (maxDuration > 60) {
            durationFactor = 60;
            durationLabel = "min";
        }

        const mapped = data.map(d => ({
            User: d.User || "Unknown",
            Count: d.Count ?? 0,
            DurationDisplay: d.Duration ? d.Duration / durationFactor : 0,
            _DurationLabel: durationLabel,
            "Begin Timestamp": d["Begin Timestamp"] || null
        }));

        LOGGER.info("Processed chartData", mapped);
        return mapped;
    }, [data]);

    // -------------------------------
    // Determine Y-axis label dynamically
    // -------------------------------
    const yAxisLabel = useMemo(() => {
        const durationLabel = chartData[0]?._DurationLabel || "s";
        if (focusMetric === "Count") return "Count";
        if (focusMetric === "Duration") return durationLabel;
        return `Count / Duration (${durationLabel})`;
    }, [focusMetric, chartData]);

    if (loading) return <ComponentLoading />;
    if (!data.length) return <div>No data available</div>;

    const isLineChart = ["date", "default"].includes(viewMode);
    const xKey = viewMode === "date" ? "Begin Timestamp" : "User";

    return (
        <div>
            {/* Controls */}
            <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                    <label>View Mode: </label>
                    <select value={viewMode} onChange={e => setViewMode(e.target.value)}>
                        <option value="default">Default (User sum)</option>
                        <option value="user">User (individual entries)</option>
                        <option value="date">Date ascending</option>
                        <option value="user_date">User by date</option>
                        <option value="raw">Raw (all entries)</option>
                    </select>
                </div>

                <div>
                    <label>Focus Metric: </label>
                    <select value={focusMetric} onChange={e => setFocusMetric(e.target.value)}>
                        <option value="both">Both</option>
                        <option value="Count">Count</option>
                        <option value="Duration">Duration</option>
                    </select>
                </div>
            </div>

            {/* Chart */}
            <div style={{ overflowX: "auto", width: "100%" }}>
                {/* <div style={{ width: chartData.length * 50 }}> adjust 50px per data  */}
                <div style={{ width: chartData.length * 80 }}> {/* previously 50px */}

                    {isLineChart ? (
                        <LineChart
                            data={chartData}
                            width={Math.max(chartData.length * 80, 600)} // minimum width 600px
                            height={400}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey={xKey}
                                interval={0} // show all ticks
                                tickFormatter={val =>
                                    xKey === "Begin Timestamp" && val ? new Date(val).toLocaleDateString() : val
                                }
                                angle={-90} // tilt labels 90 degrees
                                textAnchor="end" // aligns tilted labels nicely
                            />
                            <YAxis
                                label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
                                tickFormatter={value => {
                                    // Match scaled DurationDisplay values
                                    if (focusMetric === "Duration" || focusMetric === "both") {
                                        const durationLabel = chartData[0]?._DurationLabel ?? "s";
                                        return `${value.toFixed(1)} ${durationLabel}`; // e.g., 1.5 h
                                    }
                                    return value;
                                }}
                            />

                            <Tooltip
                                formatter={(value, name, props) => {
                                    const payload = props?.payload || {};
                                    LOGGER.info("Tooltip payload", payload, name, value);
                                    if (name === "DurationDisplay") return [payload.DurationDisplay ?? 0, `Duration (${payload._DurationLabel ?? "s"})`];
                                    if (name === "Count") return [payload.Count ?? 0, "Count"];
                                    if (name === "User") return [payload.User ?? "Unknown", "User"];
                                    return [value ?? "-", name];
                                }}
                                labelFormatter={val =>
                                    xKey === "Begin Timestamp" && val ? new Date(val).toLocaleString() : val
                                }
                            />
                            <Legend />
                            {(focusMetric === "both" || focusMetric === "Count") && (
                                <Line type="monotone" dataKey="Count" stroke="#8884d8" activeDot={{ r: 8 }} />
                            )}
                            {(focusMetric === "both" || focusMetric === "Duration") && (
                                <Line type="monotone" dataKey="DurationDisplay" stroke="#82ca9d" />
                            )}
                        </LineChart>
                    ) : (
                        <BarChart
                            data={chartData}
                            width={Math.max(chartData.length * 80, 600)}
                            height={400}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey={xKey}
                                interval={0} // show all ticks
                                tickFormatter={val =>
                                    xKey === "Begin Timestamp" && val ? new Date(val).toLocaleDateString() : val
                                }
                                angle={-45} // tilt labels 45 degrees
                                textAnchor="end" // aligns tilted labels nicely
                            />
                            <YAxis
                                label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
                                tickFormatter={value => {
                                    // Match scaled DurationDisplay values
                                    if (focusMetric === "Duration" || focusMetric === "both") {
                                        const durationLabel = chartData[0]?._DurationLabel ?? "s";
                                        return `${value.toFixed(1)} ${durationLabel}`; // e.g., 1.5 h
                                    }
                                    return value;
                                }}
                            />
                            <Tooltip
                                formatter={(value, name, props) => {
                                    const payload = props?.payload || {};
                                    LOGGER.info("Tooltip payload", payload, name, value);
                                    if (name === "DurationDisplay") return [payload.DurationDisplay ?? 0, `Duration (${payload._DurationLabel ?? "s"})`];
                                    if (name === "Count") return [payload.Count ?? 0, "Count"];
                                    if (name === "User") return [payload.User ?? "Unknown", "User"];
                                    return [value ?? "-", name];
                                }}
                                labelFormatter={val => val}
                            />
                            <Legend />
                            {(focusMetric === "both" || focusMetric === "Count") && <Bar dataKey="Count" fill="#8884d8" />}
                            {(focusMetric === "both" || focusMetric === "Duration") && <Bar dataKey="DurationDisplay" fill="#82ca9d" />}
                        </BarChart>
                    )}
                </div>
            </div>

        </div>
    );
};

export default CounterSessionChart;
