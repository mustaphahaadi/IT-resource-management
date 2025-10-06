import { Navigate } from "react-router-dom";
import { usePermissions } from "../../contexts/PermissionsContext";

const RoleBasedRoute = ({ children, requiredRoles }) => {
  const { userRole } = usePermissions();

  if (!requiredRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default RoleBasedRoute;
