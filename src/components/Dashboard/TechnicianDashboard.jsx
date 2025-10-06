import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

const TechnicianDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnicianData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getTechnicianDashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching technician dashboard data:', error);
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicianData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-green-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <WrenchScrewdriverIcon className="w-5 h-5 text-green-600" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.active_tasks || 0}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_tasks || 0}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{stats.overdue_tasks || 0}</div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicianDashboard;
