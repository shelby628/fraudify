import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("authToken"); // check for token

  if (!token) {
    // user is not logged in → redirect
    return <Navigate to="/login" />;
  }

  // user is logged in → show the requested component
  return children;
}
