import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Inbox,
  Mail,
  Settings,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import AdminService from "../../services/AdminService";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

import ProfilePanel from "../../components/admin/users/ProfilePanel";
import UsersToolbar from "../../components/admin/users/UsersToolbar";
import Pagination from "../../components/admin/users/Pagination";
import UsersTable from "../../components/admin/users/UsersTable";
import DeleteUserModal from "../../components/admin/users/DeleteUserModal";

const statuses = ["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

export default function UsersPage() {
  const [stats, setStats] = useState(null);
  const [usersPage, setUsersPage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeView, setActiveView] = useState("users");
  
  // Modal state variables
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);

  const users = usersPage?.users || [];
  const userCount = usersPage?.totalElements || 0;

  const statCards = useMemo(
    () => [
      { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, tone: "text-indigo-600" },
      { label: "Pending", value: stats?.pendingUsers || 0, icon: Clock3, tone: "text-amber-600" },
      { label: "Approved", value: stats?.approvedUsers || 0, icon: CheckCircle2, tone: "text-emerald-600" },
      { label: "Rejected", value: stats?.rejectedUsers || 0, icon: XCircle, tone: "text-red-600" },
    ],
    [stats]
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    setSearchParams({
        status,
        page
    });
    loadUsers();
  }, [status, page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
      loadUsers(0);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus && urlStatus !== status) {
        setStatus(urlStatus);
    }
  }, [searchParams]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        AdminService.getDashboardStats(),
        AdminService.getUsers({ status, search, page: 0 }),
      ]);
      setStats(statsResponse.data.data);
      setUsersPage(usersResponse.data.data);
      setSelectedUser(usersResponse.data.data.users?.[0] || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load admin dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers(nextPage = page) {
    setUsersLoading(true);
    try {
      const response = await AdminService.getUsers({
        status,
        search,
        page: nextPage,
      });
      const data = response.data.data;
      setUsersPage(data);
      if (!selectedUser || !data.users.some((user) => user.id === selectedUser.id)) {
        setSelectedUser(data.users?.[0] || null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load users");
    } finally {
      setUsersLoading(false);
    }
  }

  async function refreshAdminData() {
    const [statsResponse, usersResponse] = await Promise.all([
      AdminService.getDashboardStats(),
      AdminService.getUsers({ status, search, page }),
    ]);
    setStats(statsResponse.data.data);
    setUsersPage(usersResponse.data.data);
  }

  async function handleAction(user, action) {
    const actionKey = `${action}-${user.id}`;
    setActionLoading(actionKey);
    try {
      let response;
      if (action === "approve") response = await AdminService.approveUser(user.id);
      if (action === "reject") response = await AdminService.rejectUser(user.id);
      
      if (action === "delete") {
        setDeleteUser(user);
        setDeleteModalOpen(true);
        setActionLoading(null);
        return;
      }
      
      if (action === "resend") response = await AdminService.resendActivationEmail(user.id);

      await refreshAdminData();
      setSelectedUser(action === "delete" ? null : response.data.data);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function confirmDelete() {
    try {
        setActionLoading(`delete-${deleteUser.id}`);
        await AdminService.deleteUser(deleteUser.id);
        toast.success("User deleted successfully");
        await refreshAdminData();
        setDeleteModalOpen(false);
        setDeleteUser(null);
    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Delete failed"
        );
    } finally {
        setActionLoading(null);
    }
  }

  if (loading) return <AdminDashboardSkeleton />;

  return (
    <div className="space-y-8 text-[var(--text)]">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Admin Portal</p>
          <h1 className="mt-2 text-3xl font-bold">Workspace control center</h1>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-sm shadow-sm">
          <AdminTab active={activeView === "users"} icon={Users} label="Users" onClick={() => setActiveView("users")} />
          <AdminTab active={activeView === "queries"} icon={Inbox} label="Queries" onClick={() => setActiveView("queries")} />
          <AdminTab active={activeView === "settings"} icon={Settings} label="Settings" onClick={() => setActiveView("settings")} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <Card key={item.label} className="rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
                <p className="mt-3 text-3xl font-bold">{item.value}</p>
              </div>
              <item.icon className={item.tone} size={28} />
            </div>
          </Card>
        ))}
      </section>

      {activeView === "users" && (
        <section className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="rounded-lg">
            <UsersToolbar
              search={search}
              setSearch={setSearch}
              status={status}
              setStatus={(value) => {
                setPage(0);
                setStatus(value);
              }}
              setPage={setPage}
              userCount={userCount}
              statuses={statuses}
            />

            <UsersTable
              users={users}
              usersLoading={usersLoading}
              selectedUser={selectedUser}
              actionLoading={actionLoading}
              onSelect={setSelectedUser}
              onAction={handleAction}
            />

            <Pagination 
              usersPage={usersPage} 
              setPage={setPage} 
            />
          </Card>

          <div className="hidden xl:block">
            <ProfilePanel user={selectedUser} actionLoading={actionLoading} onAction={handleAction} />
          </div>
        </section>
      )}

      {activeView === "queries" && <FuturePanel icon={Mail} title="Query and contact management" description="This area is ready for support tickets." />}
      {activeView === "settings" && <FuturePanel icon={ShieldCheck} title="Admin settings" description="Future operational controls can live here." />}

      {/* Delete Confirmation Modal Overlay */}
      <DeleteUserModal
        open={deleteModalOpen}
        user={deleteUser}
        loading={actionLoading === `delete-${deleteUser?.id}`}
        onClose={() => {
            setDeleteModalOpen(false);
            setDeleteUser(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function AdminTab({ active, icon: Icon, label, onClick }) {
  return (
    <button className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition ${active ? "bg-indigo-600 text-white" : "text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800"}`} onClick={onClick} type="button">
      <Icon size={17} /> {label}
    </button>
  );
}

function FuturePanel({ icon: Icon, title, description }) {
  return (<Card className="rounded-lg p-8"><EmptyState icon={Icon} title={title} description={description} /></Card>);
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />)}
      </div>
      <div className="h-96 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}