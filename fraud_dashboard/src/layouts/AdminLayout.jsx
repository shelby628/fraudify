import Sidebar from "../components/Sidebar";

export default function AdminLayout({ children }) {
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />

            <main style={{
                marginLeft: "150px", // MUST match sidebar width
                padding: "24px",
                width: "100%",
                background: "#f9fafb",
                minHeight: "100vh"
            }}>
                {children}
            </main>
        </div>
    );
}


