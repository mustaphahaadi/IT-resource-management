import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const EndUserDashboard = ({ stats }) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />
          My Support Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{stats.open || 0}</div>
            <div className="text-xs text-gray-600">Open</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{stats.assigned || 0}</div>
            <div className="text-xs text-gray-600">Assigned</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EndUserDashboard;
