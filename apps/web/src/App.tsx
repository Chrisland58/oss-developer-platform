import { Routes, Route, NavLink } from "react-router-dom";
import WalletSetup from "./pages/WalletSetup";
import StreamingSimulator from "./pages/StreamingSimulator";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-8">
        <span className="text-lg font-semibold text-white tracking-tight">
          OSS Platform
        </span>
        <nav className="flex gap-6 text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "text-indigo-400 font-medium" : "text-gray-400 hover:text-white"
            }
          >
            Wallet Setup
          </NavLink>
          <NavLink
            to="/streaming"
            className={({ isActive }) =>
              isActive ? "text-indigo-400 font-medium" : "text-gray-400 hover:text-white"
            }
          >
            Capital Streaming
          </NavLink>
        </nav>
      </header>

      {/* Page Content */}
      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<WalletSetup />} />
          <Route path="/streaming" element={<StreamingSimulator />} />
        </Routes>
      </main>
    </div>
  );
}
