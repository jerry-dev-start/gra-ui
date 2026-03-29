import {useUserStore} from "@/stores/user.ts";
import {useMemo} from "react";

export const  usePermission = ()=>{
    const permission = useUserStore((state) => state.permissions)

    return useMemo(() => {
        const permsSet = new Set(permission)
        return {
            has: (code: string) => permsSet.has('*.*.*') || permsSet.has(code),
            hasAny: (codes: string[]) => codes.some(code => permsSet.has(code)),
            hasAll: (codes: string[]) => codes.every(code => permsSet.has(code)),
        };
    }, [permission]);
}
