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
 * Enum-like object for simplified display levels.
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
 * Props:
 * - apiUrl (string): API endpoint.
 * - defaultViewMode (string): Initial view mode.
 * - showControls (boolean): Whether to render view/user controls.
 * - defaultUser (string): Default user for individual_user mode.
 * - simplifiedLevel (number): Simplified display level.
 * - backgroundColor (string): Chart container background.
 * - title (string): Optional title above chart.
 * - description (string): Optional description above chart.
 */
const CounterSessionChart = ({
    apiUrl,
    defaultViewMode = "default",
    showControls = true,
    defaultUser = "None",
    simplifiedLevel = SimplifiedLevel.AXES_ONLY,
    backgroundColor = "transparent",
    title,
    description
}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(defaultViewMode);
    const [focusMetric, setFocusMetric] = useState("both");
    const [selectedUser, setSelectedUser] = useState(defaultUser);

    // Fetch data whenever viewMode or selectedUser changes
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

    // Process chart data and scale Duration
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
            "Begin Timestamp": d["Begin Timestamp"] || null,
            short_description: d.short_description || "",
            verbose_description: d.verbose_description || ""
        }));
    }, [data]);

    // Y-axis label
    const yAxisLabel = useMemo(() => {
        if (simplifiedLevel >= SimplifiedLevel.AXES_ONLY) return "";
        const durationLabel = chartData[0]?._DurationLabel || "s";
        if (focusMetric === "Count") return "Count";
        if (focusMetric === "Duration") return durationLabel;
        return `Count / Duration (${durationLabel})`;
    }, [focusMetric, chartData, simplifiedLevel]);

    // Formatting helpers
    const formatNumber = num => (num == null ? "-" : Number.isInteger(num) ? num : num.toFixed(2));
    const formatDate = ts => ts ? new Date(ts).toLocaleString() : null;

    if (loading) return <ComponentLoading />;
    if (!data.length) return <div>No data available</div>;

    const isLineChart = ["date", "default", "individual_user"].includes(viewMode);
    const xKey = viewMode === "date" || viewMode === "individual_user" ? "Begin Timestamp" : "User";

    const showGrid = simplifiedLevel < SimplifiedLevel.NO_GRID;
    const showLegend = simplifiedLevel < SimplifiedLevel.NO_GRID_LEGEND;
    const showAxes = simplifiedLevel < SimplifiedLevel.AXES_ONLY;

    // Reusable tooltip content
    const renderTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload.length) return null;
        const entry = payload[0].payload;
        return (
            <div style={{ backgroundColor: "#fff", padding: "0.5rem", borderRadius: "4px", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
                <div><strong>User:</strong> {entry.User}</div>
                <div><strong>Count:</strong> {formatNumber(entry.Count)}</div>
                <div><strong>Duration ({entry._DurationLabel}):</strong> {formatNumber(entry.DurationDisplay)}</div>
                {entry["Begin Timestamp"] && <div><strong>Start:</strong> {formatDate(entry["Begin Timestamp"])}</div>}
                {entry.short_description && <div><strong>Title:</strong> {entry.short_description}</div>}
                {entry.verbose_description && <div><strong>Description:</strong> {entry.verbose_description}</div>}
            </div>
        );
    };

    return (
        <div style={{ overflowX: "auto", width: "100%" }}>
            {/* Optional Title / Description */}
            {title && <h3 style={{ marginBottom: "0.25rem" }}>{title}</h3>}
            {description && <p style={{ marginBottom: "0.5rem", color: "#555" }}>{description}</p>}

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
            <div style={{ minWidth: Math.max(chartData.length * 80, 600), backgroundColor, padding: backgroundColor !== "transparent" ? "0.5rem" : 0, borderRadius: backgroundColor !== "transparent" ? "8px" : 0 }}>
                {isLineChart ? (
                    <LineChart data={chartData} width={Math.max(chartData.length * 80, 600)} height={simplifiedLevel >= SimplifiedLevel.AXES_ONLY ? 150 : 400} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        {showAxes && <XAxis dataKey={xKey} interval={0} tickFormatter={val => xKey === "Begin Timestamp" && val ? new Date(val).toLocaleDateString() : val} angle={-45} textAnchor="end" />}
                        {showAxes && <YAxis label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }} />}
                        <Tooltip content={renderTooltip} />
                        {(focusMetric === "both" || focusMetric === "Count") && <Line type="monotone" dataKey="Count" stroke="#8884d8" dot={simplifiedLevel < SimplifiedLevel.AXES_ONLY} />}
                        {(focusMetric === "both" || focusMetric === "Duration") && <Line type="monotone" dataKey="DurationDisplay" stroke="#82ca9d" dot={simplifiedLevel < SimplifiedLevel.AXES_ONLY} />}
                        {showLegend && <Legend />}
                    </LineChart>
                ) : (
                    <BarChart data={chartData} width={Math.max(chartData.length * 80, 600)} height={simplifiedLevel >= SimplifiedLevel.AXES_ONLY ? 150 : 400} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        {showAxes && <XAxis dataKey={xKey} interval={0} tickFormatter={val => xKey === "Begin Timestamp" && val ? new Date(val).toLocaleDateString() : val} angle={-45} textAnchor="end" />}
                        {showAxes && <YAxis label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }} />}
                        <Tooltip content={renderTooltip} />
                        {(focusMetric === "both" || focusMetric === "Count") && <Bar dataKey="Count" fill="#8884d8" />}
                        {(focusMetric === "both" || focusMetric === "Duration") && <Bar dataKey="DurationDisplay" fill="#82ca9d" />}
                        {showLegend && <Legend />}
                    </BarChart>
                )}
            </div>
        </div>
    );
};

export default CounterSessionChart;
export { SimplifiedLevel };
