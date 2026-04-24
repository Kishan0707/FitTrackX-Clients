import { Route as OriginalRoute, Routes as OriginalRoutes } from "react-router-dom";
import ProtectedRoutes from "./components/ProtectedRoutes";

const Route = ({ element, allowedRoles, ...props }) => {
  if (allowedRoles) {
    return (
      <OriginalRoute
        {...props}
        element={
          <ProtectedRoutes allowedRoles={allowedRoles}>
            {element}
          </ProtectedRoutes>
        }
      />
    );
  }
  return <OriginalRoute {...props} element={element} />;
};

const Routes = OriginalRoutes;

export { Route, Routes };
