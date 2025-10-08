import React from 'react';
import { BugReportForm, LOGGER } from '@rumpushub/common-react';

export default function CreateBugReportPage() {
    const handleSuccess = (data) => {
        LOGGER.debug('Bug report created!', data);
        alert('Bug report submitted successfully!');
    };

    return (
        <div className="container">
            <h1 className="title">Submit a Bug Report</h1>
            <BugReportForm
                endpoint="/notion-api/integrations/notion/projectManagementIntegration/pages?name=bugs"
                onSuccess={handleSuccess}
                titlePlaceholder="Bug Title"
                bodyPlaceholder="Describe the bug in detail..."
                fields={[
                    {
                        name: 'assignedTo',                // internal field name
                        notionName: 'Assigned To',         // Notion property name
                        label: 'Assigned To',
                        notionType: 'people'
                    },
                    {
                        name: 'state',
                        notionName: 'State',
                        label: 'State',
                        type: 'select',
                        notionType: 'select',
                        options: ['Open', 'In Progress', 'Closed']
                    },
                    {
                        name: 'priority',
                        notionName: 'Priority',
                        label: 'Priority',
                        type: 'select',
                        notionType: 'select',
                        options: ['Low', 'Medium', 'High']
                    }
                ]}

            />
        </div>
    );
}
