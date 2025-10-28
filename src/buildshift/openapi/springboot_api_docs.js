import React, { useState } from "react";
import { SwaggerViewer, getApiBaseURL, SingleSelector } from "@rumpushub/common-react";

const apiOptions = [
    { value: "springboot", label: "Spring Boot API" },
    { value: "django", label: "Django API" },
];

export default function ApiDocsSelector() {
    const [selectedApi, setSelectedApi] = useState(apiOptions[0].value);

    // Determine the specUrl based on selection
    const getSpecUrl = () => {
        switch (selectedApi) {
            case "springboot":
                return `${getApiBaseURL()}/api/schema`;
            case "django":
                return `${getApiBaseURL('RUMPSHIFT_API')}/api/schema`;
            default:
                return "";
        }
    };

    return (
        <div className="columns">
            <div className="column is-one-quarter p-3">
                <h2 className="title is-4">Select API</h2>
                <SingleSelector
                    options={apiOptions}
                    value={selectedApi}
                    onChange={setSelectedApi}
                    placeholder="Select an API..."
                    searchable={false}
                />
            </div>

            {/* Main content: SwaggerViewer */}
            <div className="column p-5">
                <SwaggerViewer specUrl={getSpecUrl()} />
            </div>
        </div>
    );
}
