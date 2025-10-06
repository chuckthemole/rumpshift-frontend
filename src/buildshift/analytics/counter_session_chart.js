import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";

const CounterSessionChart = ({ apiUrl }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(apiUrl, {
                    params: {
                        group_by: "User",  // Example: aggregate by user
                        agg: "sum"
                    }
                });
                setData(response.data);
            } catch (error) {
                console.error("Error fetching counter session data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl]);

    if (loading) return <div>Loading chart...</div>;
    if (!data.length) return <div>No data available</div>;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="User" /> {/* Change if grouped differently */}
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Count" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Duration" stroke="#82ca9d" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default CounterSessionChart;
