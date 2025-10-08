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
import {
    getNamedApi,
    LOGGER,
    ComponentLoading,
    TaskFilterMenu
} from "@rumpushub/common-react";

export const SimplifiedLevel = {
    DETAILED: 0,
    NO_GRID: 1,
    NO_GRID_LEGEND: 2,
    AXES_ONLY: 3,
    BARE: 4
};

const CounterSessionChart = ({
    apiUrl,
    defaultViewMode = "default",
    showControls = true,
    defaultUser = "None",
    simplifiedLevel = SimplifiedLevel.AXES_ONLY,
    backgroundColor = "transparent",
    title = false,
    description = false
}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(defaultViewMode);
    const [focusMetric, setFocusMetric] = useState("both");
    const [selectedUser, setSelectedUser] = useState(defaultUser);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const api = getNamedApi("RUMPSHIFT_API");
                const params = { view: viewMode, agg: "sum" };

                if (viewMode === "individual_user" && selectedUser)
                    params.user = selectedUser;

                LOGGER.debug("[CounterSessionChart] Fetching:", { apiUrl, params });
                const response = await api.get(apiUrl, { params });
                const payload = response?.data || [];
                LOGGER.info(`[CounterSessionChart] Received ${payload.length} records`);
                setData(Array.isArray(payload) ? payload : []);
            } catch (error) {
                LOGGER.error("[CounterSessionChart] Fetch failed:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl, viewMode, selectedUser]);

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

        return data.map(d => ({
            User: d.User || "Unknown",
            Count: d.Count ?? 0,
            DurationDisplay: (d.Duration ?? 0) / durationFactor,
            _DurationLabel: durationLabel,
            "Begin Timestamp": d["Begin Timestamp"] || null,
            short_description: d.short_description || "",
            verbose_description: d.verbose_description || ""
        }));
    }, [data]);

    const yAxisLabel = useMemo(() => {
        if (simplifiedLevel >= SimplifiedLevel.AXES_ONLY) return "";
        const label = chartData[0]?._DurationLabel || "s";
        if (focusMetric === "Count") return "Count";
        if (focusMetric === "Duration") return label;
        return `Count / Duration (${label})`;
    }, [focusMetric, chartData, simplifiedLevel]);

    const formatNumber = num =>
        num == null ? "-" : Number.isInteger(num) ? num : num.toFixed(2);

    const formatDate = ts => (ts ? new Date(ts).toLocaleString() : null);

    const renderTooltip = ({ active, payload }) => {
        if (!active || !payload?.length) return null;
        const entry = payload[0].payload;

        return (
            <div
                style={{
                    backgroundColor: "#fff",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                }}
            >
                <div><strong>User:</strong> {entry.User}</div>
                <div><strong>Count:</strong> {formatNumber(entry.Count)}</div>
                <div>
                    <strong>Duration ({entry._DurationLabel}):</strong>{" "}
                    {formatNumber(entry.DurationDisplay)}
                </div>
                {entry["Begin Timestamp"] && (
                    <div><strong>Start:</strong> {formatDate(entry["Begin Timestamp"])}</div>
                )}
                {entry.short_description && (
                    <div><strong>Title:</strong> {entry.short_description}</div>
                )}
                {entry.verbose_description && (
                    <div><strong>Description:</strong> {entry.verbose_description}</div>
                )}
            </div>
        );
    };

    if (loading) return <ComponentLoading />;

    const isLineChart = ["date", "default", "individual_user"].includes(viewMode);
    const xKey = ["date", "individual_user"].includes(viewMode)
        ? "Begin Timestamp"
        : "User";

    const showGrid = simplifiedLevel < SimplifiedLevel.NO_GRID;
    const showLegend = simplifiedLevel < SimplifiedLevel.NO_GRID_LEGEND;
    const showAxes = simplifiedLevel < SimplifiedLevel.AXES_ONLY;

    return (
        <div style={{ overflowX: "auto", width: "100%" }}>
            {title && <h3 style={{ marginBottom: "0.25rem" }}>{title}</h3>}
            {description && (
                <p style={{ marginBottom: "0.5rem", color: "#555" }}>{description}</p>
            )}

            {showControls && (
                <div
                    style={{
                        marginBottom: "1rem",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                    }}
                >
                    <TaskFilterMenu
                        isModal
                        buttonLabel="Filters"
                        filters={[
                            {
                                key: "viewMode",
                                label: "View Mode",
                                type: "select",
                                options: [
                                    { value: "default", label: "Default (User sum)" },
                                    { value: "user", label: "User (individual entries)" },
                                    { value: "date", label: "Date ascending" },
                                    { value: "user_date", label: "User by date" },
                                    { value: "raw", label: "Raw (all entries)" },
                                    { value: "individual_user", label: "Individual User" },
                                ],
                            },
                            {
                                key: "focusMetric",
                                label: "Focus Metric",
                                type: "select",
                                options: [
                                    { value: "both", label: "Both" },
                                    { value: "Count", label: "Count" },
                                    { value: "Duration", label: "Duration" },
                                ],
                            },
                            ...(viewMode === "individual_user"
                                ? [
                                    {
                                        key: "selectedUser",
                                        label: "User",
                                        type: "select",
                                        options: [], // later fill dynamically
                                    },
                                ]
                                : []),
                        ]}
                        values={{
                            viewMode,
                            focusMetric,
                            selectedUser,
                        }}
                        onChange={(updatedValues) => {
                            if (updatedValues.viewMode !== undefined)
                                setViewMode(updatedValues.viewMode);
                            if (updatedValues.focusMetric !== undefined)
                                setFocusMetric(updatedValues.focusMetric);
                            if (updatedValues.selectedUser !== undefined)
                                setSelectedUser(updatedValues.selectedUser);
                        }}
                        styles={{
                            container: { minWidth: "300px" },
                            button: {
                                backgroundColor: "#3273dc",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "0.5rem 1rem",
                                cursor: "pointer",
                            },
                        }}
                    />
                </div>
            )}

            {!data.length ? (
                <div style={{ textAlign: "center", color: "#777", padding: "2rem" }}>
                    No data available for current filters.
                </div>
            ) : (
                <div
                    style={{
                        minWidth: Math.max(chartData.length * 80, 600),
                        backgroundColor,
                        padding: backgroundColor !== "transparent" ? "0.5rem" : 0,
                        borderRadius: backgroundColor !== "transparent" ? "8px" : 0
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
                                    tickFormatter={(val) =>
                                        xKey === "Begin Timestamp" && val
                                            ? new Date(val).toLocaleDateString()
                                            : val
                                    }
                                    angle={-45}
                                    textAnchor="end"
                                />
                            )}
                            {showAxes && (
                                <YAxis
                                    label={{
                                        value: yAxisLabel,
                                        angle: -90,
                                        position: "insideLeft"
                                    }}
                                />
                            )}
                            <Tooltip content={renderTooltip} />
                            {(focusMetric === "both" || focusMetric === "Count") && (
                                <Line type="monotone" dataKey="Count" stroke="#8884d8" />
                            )}
                            {(focusMetric === "both" || focusMetric === "Duration") && (
                                <Line
                                    type="monotone"
                                    dataKey="DurationDisplay"
                                    stroke="#82ca9d"
                                />
                            )}
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
                                    tickFormatter={(val) =>
                                        xKey === "Begin Timestamp" && val
                                            ? new Date(val).toLocaleDateString()
                                            : val
                                    }
                                    angle={-45}
                                    textAnchor="end"
                                />
                            )}
                            {showAxes && (
                                <YAxis
                                    label={{
                                        value: yAxisLabel,
                                        angle: -90,
                                        position: "insideLeft"
                                    }}
                                />
                            )}
                            <Tooltip content={renderTooltip} />
                            {(focusMetric === "both" || focusMetric === "Count") && (
                                <Bar dataKey="Count" fill="#8884d8" />
                            )}
                            {(focusMetric === "both" || focusMetric === "Duration") && (
                                <Bar dataKey="DurationDisplay" fill="#82ca9d" />
                            )}
                            {showLegend && <Legend />}
                        </BarChart>
                    )}
                </div>
            )}
        </div>
    );
};

export default CounterSessionChart;
