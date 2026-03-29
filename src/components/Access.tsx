import React from "react";
import {usePermission} from "@/hooks/usePermission.ts";

interface AccessProps {
    code?:string;
    any?: string[];
    all?:string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}
const Access: React.FC<AccessProps> = ({code,any,all,children,fallback = null}) => {
    const {has,hasAll,hasAny} = usePermission()
    let canAccess = false;
    if (code) canAccess = has(code);
    else if (any) canAccess = hasAny(any);
    else if (all) canAccess = hasAll(all);
    else canAccess = true;
    return canAccess ?<>{children}</>:<>{fallback}</>
}
export default Access