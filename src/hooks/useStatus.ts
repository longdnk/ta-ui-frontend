import { useState } from "react";

export const useStatus = () => {
    const [status, setStatus] = useState<boolean>(false);

    return {
        status,
        setStatus
    }
}