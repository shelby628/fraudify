import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ marginLeft: "150px", flex: 1, padding: "24px", background: "linear-gradient(135deg, #e8f0d8 0%, #fef5e0 50%, #fde8dc 100%)", minHeight: "100vh" }}>
                <Outlet />
            </div>
        </div>
    );
}
