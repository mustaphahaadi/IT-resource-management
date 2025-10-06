import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ComputerDesktopIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getManagerDashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching manager dashboard data:', error);
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchManagerData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ComputerDesktopIcon className="w-5 h-5 text-purple-600" />
            Equipment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.equipment_stats?.total || 0}</div>
              <div className="text-xs text-gray-600">Total Assets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.equipment_stats?.critical || 0}</div>
              <div className="text-xs text-gray-600">Critical</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.request_stats?.unassigned || 0}</div>
              <div className="text-xs text-gray-600">Unassigned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.request_stats?.high_priority || 0}</div>
              <div className="text-xs text-gray-600">High Priority</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-5 h-5 text-red-600" />
            Task Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.task_stats?.overdue || 0}</div>
              <div className="text-xs text-gray-600">Overdue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.task_stats?.in_progress || 0}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
