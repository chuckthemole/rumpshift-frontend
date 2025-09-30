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
                endpoint="/api/bugs"  // the API endpoint to POST to
                onSuccess={handleSuccess}
                titlePlaceholder="Bug Title"
                bodyPlaceholder="Describe the bug in detail..."
                fields={[
                    { name: 'assignedTo', label: 'Assigned To' },
                    { name: 'state', label: 'State', type: 'select', options: ['Open', 'In Progress', 'Closed'] },
                    { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] }
                ]}
            />
        </div>
    );
}
