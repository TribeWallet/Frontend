import {useAppContext} from "../../../contexts/AppContext";

export function useAppDashboard() {
    const ctx = useAppContext();
    return {
        data: ctx.dashboard,
        isLoading: ctx.dashboardLoading,
        isError: ctx.dashboardError,
        refetch: ctx.refetchDashboard,
    };
}