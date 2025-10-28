import React from 'react';
import { SwaggerViewer, getApiBaseURL } from "@rumpushub/common-react";

const SpringbootApiDocs = () => {

    return (
        <SwaggerViewer specUrl={`${getApiBaseURL()}/api/schema`} />
    );
};

export default SpringbootApiDocs;
