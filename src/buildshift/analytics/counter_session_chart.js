import React, { useEffect, useState, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart,
    Bar
} from "recharts";
import { getNamedApi, LOGGER, ComponentLoading } from "@rumpushub/common-react";

/**
 * Enum-like object for simplified levels.
 * 0 = Fully detailed
 * 1 = Hide grid
 * 2 = Hide grid + legend
 * 3 = Hide grid + legend, keep axes
 * 4 = Bare minimum (tooltip only)
 */
const SimplifiedLevel = {
    DETAILED: 0,
    NO_GRID: 1,
    NO_GRID_LEGEND: 2,
    AXES_ONLY: 3,
    BARE: 4
};

/**
 * CounterSessionChart
 *
 * A flexible chart component for rendering user/session metrics using Recharts.
 * Supports LineChart and BarChart with various view modes and focus metrics.
 * Includes multiple simplified levels for compact display.
 *
 * Props:
 * - apiUrl (string): API endpoint for fetching counter session data.
 * - defaultViewMode (string): Initial view mode (default, user, date, etc.).
 * - showControls (boolean): Whether to render the controls for changing view/focus/user.
 * - defaultUser (string): Default user for individual_user view mode.
 * - simplifiedLevel (number): Level of simplified display (0 = detailed, 4 = bare minimum)
 * - backgroundColor (string): Background color of chart container ("transparent" or any CSS color)
 */
const CounterSessionChart = ({
    apiUrl,
    defaultViewMode = "default",
    showControls = true,
    defaultUser = 'None',
    simplifiedLevel = SimplifiedLevel.AXES_ONLY,
    backgroundColor = "transparent"
}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(defaultViewMode);
    const [focusMetric, setFocusMetric] = useState("both");
    const [selectedUser, setSelectedUser] = useState(defaultUser);

    // Fetch data whenever apiUrl, viewMode, or selectedUser changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const api = getNamedApi("RUMPSHIFT_API");
                const params = { view: viewMode, agg: "sum" };
                if (viewMode === "individual_user" && selectedUser) {
                    params.user = selectedUser;
                }
                const response = await api.get(apiUrl, { params });
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
    }, [apiUrl, viewMode, selectedUser]);

    // Process chart data and compute duration scaling
    const chartData = useMemo(() => {
        if (!data.length) return [];
        const maxDuration = Math.max(...data.map(d => d.Duration || 0));
        let durationFactor = 1;
        let durationLabel = "s";

        if (maxDuration > 3600) durationFactor = 3600, durationLabel = "h";
        else if (maxDuration > 60) durationFactor = 60, durationLabel = "min";

        return data.map(d => ({
            User: d.User || "Unknown",
            Count: d.Count ?? 0,
            DurationDisplay: d.Duration ? d.Duration / durationFactor : 0,
            _DurationLabel: durationLabel,
            "Begin Timestamp": d["Begin Timestamp"] || null
        }));
    }, [data]);

    // Determine Y-axis label text
    const yAxisLabel = useMemo(() => {
        if (simplifiedLevel >= SimplifiedLevel.AXES_ONLY) return "";
        const durationLabel = chartData[0]?._DurationLabel || "s";
        if (focusMetric === "Count") return "Count";
        if (focusMetric === "Duration") return durationLabel;
        return `Count / Duration (${durationLabel})`;
    }, [focusMetric, chartData, simplifiedLevel]);

    if (loading) return <ComponentLoading />;
    if (!data.length) return <div>No data available</div>;

    const isLineChart = ["date", "default", "individual_user"].includes(viewMode);
    const xKey = viewMode === "date" || viewMode === "individual_user" ? "Begin Timestamp" : "User";

    const showGrid = simplifiedLevel < SimplifiedLevel.NO_GRID;
    const showLegend = simplifiedLevel < SimplifiedLevel.NO_GRID_LEGEND;
    const showAxes = simplifiedLevel < SimplifiedLevel.AXES_ONLY;

    return (
        <div style={{ overflowX: "auto", width: "100%" }}>
            {/* Optional Controls */}
            {showControls && simplifiedLevel === SimplifiedLevel.DETAILED && (
                <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                        <label>View Mode: </label>
                        <select value={viewMode} onChange={e => setViewMode(e.target.value)}>
                            <option value="default">Default (User sum)</option>
                            <option value="user">User (individual entries)</option>
                            <option value="date">Date ascending</option>
                            <option value="user_date">User by date</option>
                            <option value="raw">Raw (all entries)</option>
                            <option value="individual_user">Individual User</option>
                        </select>
                    </div>

                    {viewMode === "individual_user" && (
                        <div>
                            <label>User: </label>
                            <input
                                type="text"
                                value={selectedUser || ""}
                                onChange={e => setSelectedUser(e.target.value)}
                                placeholder="Enter username"
                            />
                        </div>
                    )}

                    <div>
                        <label>Focus Metric: </label>
                        <select value={focusMetric} onChange={e => setFocusMetric(e.target.value)}>
                            <option value="both">Both</option>
                            <option value="Count">Count</option>
                            <option value="Duration">Duration</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Chart Container */}
            <div style={{ overflowX: "auto", width: "100%" }}>
                <div
                    style={{
                        minWidth: Math.max(chartData.length * 80, 600), // match chart width
                        backgroundColor: backgroundColor,
                        padding: backgroundColor !== "transparent" ? "0.5rem" : 0,
                        borderRadius: backgroundColor !== "transparent" ? "8px" : 0,
                        boxShadow: backgroundColor !== "transparent" ? "0 2px 6px rgba(0,0,0,0.1)" : "none"
                    }}
                >
                    {isLineChart ? (
                        <LineChart
                            data={chartData}
                            width={Math.max(chartData.length * 80, 600)}
                            height={simplifiedLevel >= SimplifiedLevel.AXES_ONLY ? 150 : 400}
                            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                            {showAxes && (
                                <XAxis
                                    dataKey={xKey}
                                    interval={0}
                                    tickFormatter={val => xKey === "Begin Timestamp" && val ? new Date(val).toLocaleDateString() : val}
                                    angle={-45}
                                    textAnchor="end"
                                />
                            )}
                            {showAxes && (
                                <YAxis
                                    label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
                                    tickFormatter={value =>
                                        (focusMetric === "Duration" || focusMetric === "both")
                                            ? `${value.toFixed(1)} ${chartData[0]?._DurationLabel ?? "s"}`
                                            : value
                                    }
                                />
                            )}
                            <Tooltip
                                formatter={(value, name, props) => {
                                    const payload = props?.payload || {};
                                    if (name === "DurationDisplay") return [payload.DurationDisplay ?? 0, `Duration (${payload._DurationLabel ?? "s"})`];
                                    if (name === "Count") return [payload.Count ?? 0, "Count"];
                                    if (name === "User") return [payload.User ?? "Unknown", "User"];
                                    return [value ?? "-", name];
                                }}
                                labelFormatter={val => xKey === "Begin Timestamp" && val ? new Date(val).toLocaleString() : val}
                            />
                            {(focusMetric === "both" || focusMetric === "Count") && <Line type="monotone" dataKey="Count" stroke="#8884d8" dot={simplifiedLevel < SimplifiedLevel.AXES_ONLY} />}
                            {(focusMetric === "both" || focusMetric === "Duration") && <Line type="monotone" dataKey="DurationDisplay" stroke="#82ca9d" dot={simplifiedLevel < SimplifiedLevel.AXES_ONLY} />}
                            {showLegend && <Legend />}
                        </LineChart>
                    ) : (
                        <BarChart
                            data={chartData}
                            width={Math.max(chartData.length * 80, 600)}
                            height={simplifiedLevel >= SimplifiedLevel.AXES_ONLY ? 150 : 400}
                            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                            {showAxes && (
                                <XAxis
                                    dataKey={xKey}
                                    interval={0}
                                    tickFormatter={val => xKey === "Begin Timestamp" && val ? new Date(val).toLocaleDateString() : val}
                                    angle={-45}
                                    textAnchor="end"
                                />
                            )}
                            {showAxes && (
                                <YAxis
                                    label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
                                    tickFormatter={value =>
                                        (focusMetric === "Duration" || focusMetric === "both")
                                            ? `${value.toFixed(1)} ${chartData[0]?._DurationLabel ?? "s"}`
                                            : value
                                    }
                                />
                            )}
                            <Tooltip
                                formatter={(value, name, props) => {
                                    const payload = props?.payload || {};
                                    if (name === "DurationDisplay") return [payload.DurationDisplay ?? 0, `Duration (${payload._DurationLabel ?? "s"})`];
                                    if (name === "Count") return [payload.Count ?? 0, "Count"];
                                    if (name === "User") return [payload.User ?? "Unknown", "User"];
                                    return [value ?? "-", name];
                                }}
                            />
                            {(focusMetric === "both" || focusMetric === "Count") && <Bar dataKey="Count" fill="#8884d8" />}
                            {(focusMetric === "both" || focusMetric === "Duration") && <Bar dataKey="DurationDisplay" fill="#82ca9d" />}
                            {showLegend && <Legend />}
                        </BarChart>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CounterSessionChart;
export { SimplifiedLevel };
