import React, { useCallback, useMemo } from "react";
import { EntityTaskManager } from "@rumpushub/common-react";

export default function MachineTaskManager() {
    return (
        <>
            <EntityTaskManager
                entityName="Machine"
                title="Machine & Tasks Manager"
                apiName="RUMPSHIFT_API"
                endpoints={{
                    getEntities: "/api/arduino_consumer/arduino/get-machines/",
                    getTasks: "/api/arduino_consumer/arduino/get-tasks/",
                    addEntity: "/api/arduino_consumer/arduino/add-machine/",
                    removeEntity: "/api/arduino_consumer/arduino/remove-machine/",
                    updateTask: "/api/arduino_consumer/arduino/task-update/",
                    deleteEntities: "/api/arduino_consumer/arduino/delete-machines/",
                }}
            />
        </>
    );
}
