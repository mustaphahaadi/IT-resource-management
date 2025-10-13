import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from "@heroicons/react/24/outline"
import AsyncSelect from "../components/ui/AsyncSelect"
import { usePermissions, PermissionGate } from "../contexts/PermissionsContext";

const SecurityAudit = () => {
  const { hasPermission } = usePermissions();
  const [auditLogs, setAuditLogs] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockAuditLogs = [
      {
        id: 1,
        timestamp: "2024-10-10T14:30:00Z",
        user: "admin1@hospital.com",
        action: "User Login",
        resource: "Authentication System",
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        status: "success",
        details: "Successful login from trusted device"
      },
      {
        id: 2,
        timestamp: "2024-10-10T14:25:00Z",
        user: "tech1@hospital.com",
        action: "Equipment Update",
        resource: "Equipment ID: EQ-001",
        ip_address: "192.168.1.105",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        status: "success",
        details: "Updated equipment status to 'maintenance'"
      },
      {
        id: 3,
        timestamp: "2024-10-10T14:20:00Z",
        user: "unknown@external.com",
        action: "Failed Login Attempt",
        resource: "Authentication System",
        ip_address: "203.0.113.45",
        user_agent: "curl/7.68.0",
        status: "failed",
        details: "Multiple failed login attempts detected"
      },
      {
        id: 4,
        timestamp: "2024-10-10T14:15:00Z",
        user: "manager1@hospital.com",
        action: "User Approval",
        resource: "User ID: 15",
        ip_address: "192.168.1.102",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        status: "success",
        details: "Approved new user registration"
      },
      {
        id: 5,
        timestamp: "2024-10-10T14:10:00Z",
        user: "system",
        action: "Automated Backup",
        resource: "Database",
        ip_address: "127.0.0.1",
        user_agent: "System Process",
        status: "success",
        details: "Daily database backup completed successfully"
      }
    ];

    const mockSecurityAlerts = [
      {
        id: 1,
        type: "suspicious_activity",
        severity: "high",
        title: "Multiple Failed Login Attempts",
        description: "5 failed login attempts from IP 203.0.113.45 in the last 10 minutes",
        timestamp: "2024-10-10T14:20:00Z",
        status: "active",
        affected_resource: "Authentication System"
      },
      {
        id: 2,
        type: "policy_violation",
        severity: "medium",
        title: "Password Policy Violation",
        description: "User attempted to set weak password",
        timestamp: "2024-10-10T13:45:00Z",
        status: "resolved",
        affected_resource: "User: user5@hospital.com"
      },
      {
        id: 3,
        type: "access_anomaly",
        severity: "low",
        title: "Unusual Access Pattern",
        description: "User accessing system outside normal hours",
        timestamp: "2024-10-10T02:30:00Z",
        status: "investigating",
        affected_resource: "User: tech2@hospital.com"
      }
    ];

    setAuditLogs(mockAuditLogs);
    setSecurityAlerts(mockSecurityAlerts);
    setLoading(false);
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800"
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800"
    };
    return variants[severity] || "bg-gray-100 text-gray-800";
  };

  const getAlertStatusBadge = (status) => {
    const variants = {
      active: "bg-red-100 text-red-800",
      investigating: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800"
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || log.status === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const exportAuditLogs = () => {
    // Mock export functionality
    console.log("Exporting audit logs...");
  };

  if (!hasPermission("system.monitoring")) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
            <p className="text-red-700">You don't have permission to access security and audit features.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security & Audit</h1>
          <p className="text-gray-600 mt-1">Monitor system security and audit user activities</p>
        </div>
        <Button onClick={exportAuditLogs} className="flex items-center gap-2">
          <ArrowDownTrayIcon className="w-4 h-4" />
          Export Logs
        </Button>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-3xl font-bold text-red-600">
                  {securityAlerts.filter(alert => alert.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins (24h)</p>
                <p className="text-3xl font-bold text-orange-600">12</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-3xl font-bold text-green-600">99.9%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audit Events (24h)</p>
                <p className="text-3xl font-bold text-blue-600">1,247</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                      <Badge className={getSeverityBadge(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getAlertStatusBadge(alert.status)}>
                        {alert.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <ComputerDesktopIcon className="w-4 h-4" />
                        {alert.affected_resource}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Investigate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-blue-600" />
              Audit Logs
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <AsyncSelect
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'success', label: 'Success' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'warning', label: 'Warning' }
                ]}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Resource</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">IP Address</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {log.user}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {log.resource}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {log.ip_address}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadge(log.status)}>
                        {log.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAudit;
