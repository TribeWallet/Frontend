import { apiClient } from '../../../services/api/apiClient';
import type { Dashboard } from '../Types/Dashboard';
import { endpoints } from '../../../config/api';

export async function fetchDashboard(userToken: string): Promise<Dashboard> {
    return apiClient.get<Dashboard>(endpoints.usuarios.dashboard(userToken));
}