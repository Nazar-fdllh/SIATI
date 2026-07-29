import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import NotFoundPage from '../pages/errors/NotFoundPage';

// Phase 2 components
import CheckInOutPage from '../pages/attendance/CheckInOutPage';
import HistoryPage from '../pages/attendance/HistoryPage';
import MonitorPage from '../pages/attendance/MonitorPage';
import LeaveRequestPage from '../pages/leave/LeaveRequestPage';
import LeaveHistoryPage from '../pages/leave/LeaveHistoryPage';
import LeaveBalancePage from '../pages/leave/LeaveBalancePage';
import LeaveApprovalPage from '../pages/leave/LeaveApprovalPage';
import EmployeeListPage from '../pages/employee/EmployeeListPage';
import EmployeeDetailPage from '../pages/employee/EmployeeDetailPage';
import EmployeeFormPage from '../pages/employee/EmployeeFormPage';

// Phase 3 components
import ReportPage from '../pages/reports/ReportPage';
import HolidayPage from '../pages/settings/HolidayPage';
import ShiftPage from '../pages/settings/ShiftPage';
import AuditLogPage from '../pages/settings/AuditLogPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        {/* Attendance Routes */}
        <Route path="attendance/checkin" element={<CheckInOutPage />} />
        <Route path="attendance/history" element={<HistoryPage />} />
        <Route path="attendance/monitor" element={<MonitorPage />} />

        {/* Leave Routes */}
        <Route path="leave/request" element={<LeaveRequestPage />} />
        <Route path="leave/history" element={<LeaveHistoryPage />} />
        <Route path="leave/balance" element={<LeaveBalancePage />} />
        <Route path="leave/approval" element={<LeaveApprovalPage />} />

        {/* Employee Routes */}
        <Route path="employees" element={<EmployeeListPage />} />
        <Route path="employees/new" element={<EmployeeFormPage />} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="employees/:id/edit" element={<EmployeeFormPage />} />
        {/* Reports */}
        <Route path="reports/attendance" element={<ReportPage />} />

        {/* Settings Routes */}
        <Route path="settings/holidays" element={<HolidayPage />} />
        <Route path="settings/shifts" element={<ShiftPage />} />
        <Route path="settings/audit" element={<AuditLogPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
