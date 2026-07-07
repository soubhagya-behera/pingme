import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Inbox,
  Mail,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import AdminService from "../../services/AdminService";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

const statuses = ["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

const statusStyles = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
  SUSPENDED: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [usersPage, setUsersPage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeView, setActiveView] = useState("users");

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
    loadUsers();
  }, [status, page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
      loadUsers(0);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

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

      if (action === "approve") {
        response = await AdminService.approveUser(user.id);
      }

      if (action === "reject") {
        response = await AdminService.rejectUser(user.id);
      }

      if (action === "delete") {
        response = await AdminService.deleteUser(user.id);
      }
      
      if (action === "resend") {
        response = await AdminService.resendActivationEmail(user.id);
      }

      await refreshAdminData();
      setSelectedUser(action === "delete" ? null : response.data.data);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-8 text-[var(--text)]">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Admin Portal</p>
          <h1 className="mt-2 text-3xl font-bold">Workspace control center</h1>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            Review onboarding, manage user access, and keep PingMe operations ready for growth.
          </p>
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
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="rounded-lg">
            <div className="border-b border-[var(--border)] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">User Management</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {userCount} user{userCount === 1 ? "" : "s"} match the current view.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    icon={<Search size={18} />}
                    placeholder="Search users"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                 <div
className="
flex items-center gap-2
rounded-2xl
border border-[var(--border)]
bg-[var(--card)]
px-4 py-3
"
>
    <Filter
        size={18}
        className="text-[var(--text-secondary)]"
    />

    <select
        className="
        bg-transparent
        text-[var(--text)]
        outline-none
        border-0
        "
        value={status}
        onChange={(e)=>{
            setStatus(e.target.value);
            setPage(0);
        }}
    >
        {statuses.map(item=>(
            <option
                key={item}
                value={item}
            >
                {item}
            </option>
        ))}
    </select>

</div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--text-secondary)]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">User</th>
                    <th className="px-5 py-4 font-semibold">Profession</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Joined</th>
                    <th className="px-5 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading && (
                    <tr>
                      <td colSpan="5" className="px-5 py-10 text-center text-[var(--text-secondary)]">
                        Loading users...
                      </td>
                    </tr>
                  )}

                  {!usersLoading && users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-5 py-14">
                        <EmptyState icon={Inbox} title="No users found" description="Try another status filter or search term." />
                      </td>
                    </tr>
                  )}

                  {!usersLoading &&
                    users.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        selected={selectedUser?.id === user.id}
                        actionLoading={actionLoading}
                        onSelect={() => setSelectedUser(user)}
                        onAction={handleAction}
                      />
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--text-secondary)]">
                Page {(usersPage?.page || 0) + 1} of {Math.max(usersPage?.totalPages || 1, 1)}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex items-center gap-2 px-4 py-2"
                  onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
                  disabled={usersPage?.first}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  className="flex items-center gap-2 px-4 py-2"
                  onClick={() => !usersPage?.last && setPage((currentPage) => currentPage + 1)}
                  disabled={usersPage?.last}
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </Card>

          <ProfilePanel user={selectedUser} actionLoading={actionLoading} onAction={handleAction} />
        </section>
      )}

      {activeView === "queries" && (
        <FuturePanel
          icon={Mail}
          title="Query and contact management"
          description="This area is ready for support tickets, contact requests, abuse reports, and admin follow-up workflows."
        />
      )}

      {activeView === "settings" && (
        <FuturePanel
          icon={ShieldCheck}
          title="Admin settings"
          description="Future operational controls can live here, including approval rules, audit settings, and notification preferences."
        />
      )}
    </div>
  );
}

function AdminTab({ active, icon: Icon, label, onClick }) {
  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition ${
        active ? "bg-indigo-600 text-white" : "text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

function UserRow({ user, selected, actionLoading, onSelect, onAction }) {
  return (
   <tr
    className={`
        border-b border-[var(--border)]
        transition-colors duration-200
        ${
            selected
                ? "selected-user-row"
                : "user-row"
        }
    `}
>
      <td className="px-5 py-4">
        <button className="flex items-center gap-3 text-left" onClick={onSelect} type="button">
          <UserAvatar name={user.fullName} />
          <span>
            <span className="block font-semibold text-[var(--text)]">{user.fullName}</span>
            <span className="block text-sm text-[var(--text-secondary)]">
    {user.email}
</span>
          </span>
        </button>
      </td>
      <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">{user.profession || "Not provided"}</td>
      <td className="px-5 py-4"><StatusBadge status={user.status} /></td>
      <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">{formatDate(user.createdAt)}</td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          {user.status === "PENDING" && (
            <>
              <IconButton title="Approve User" loading={actionLoading === `approve-${user.id}`} onClick={() => onAction(user, "approve")}>
                <CheckCircle2 size={17} />
              </IconButton>
              <IconButton title="Reject User" loading={actionLoading === `reject-${user.id}`} onClick={() => onAction(user, "reject")}>
                <XCircle size={17} />
              </IconButton>
            </>
          )}

          {user.status === "APPROVED" && !user.emailVerified && (
            <IconButton title="Resend Activation Email" loading={actionLoading === `resend-${user.id}`} onClick={() => onAction(user, "resend")}>
              <Mail size={17} />
            </IconButton>
          )}

          {user.status === "REJECTED" && (
            <IconButton title="Approve User" loading={actionLoading === `approve-${user.id}`} onClick={() => onAction(user, "approve")}>
              <CheckCircle2 size={17} />
            </IconButton>
          )}

          <IconButton danger title="Delete User" loading={actionLoading === `delete-${user.id}`} onClick={() => onAction(user, "delete")}>
            <Trash2 size={17} />
          </IconButton>
        </div>
      </td>
    </tr>
  );
}

function ProfilePanel({ user, actionLoading, onAction }) {
  if (!user) {
    return (
      <Card className="rounded-lg p-6">
        <EmptyState icon={UserRound} title="No profile selected" description="Select a user from the table to inspect their account." />
      </Card>
    );
  }

  return (
    <Card className="rounded-lg p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">

    <div className="flex min-w-0 flex-1 items-center gap-4">

        <UserAvatar
            name={user.fullName}
            size="large"
        />

        <div className="min-w-0">

            <h2 className="truncate text-xl font-semibold">
                {user.fullName}
            </h2>

            <p className="truncate text-sm text-[var(--text-secondary)]">
                {user.email}
            </p>

        </div>

    </div>

    <StatusBadge status={user.status} />

</div>

      <div className="mt-6 space-y-4 text-sm">
        <ProfileField label="Profession" value={user.profession || "Not provided"} />
        <ProfileField label="Phone" value={user.phone || "Not provided"} />
        <ProfileField label="Bio" value={user.bio || "No bio added yet"} />
        <ProfileField label="Joined" value={formatDate(user.createdAt)} />
        <ProfileField label="Last Seen" value={formatDate(user.lastSeen)} />
        <ProfileField label="Email Verified" value={user.emailVerified ? "Yes" : "No"} />
        <ProfileField label="Online" value={user.online ? "Online" : "Offline"} />
      </div>

      <div className="mt-6 grid gap-3">
        {user.status === "PENDING" && (
          <>
            <Button className="flex items-center justify-center gap-2" disabled={actionLoading === `approve-${user.id}`} onClick={() => onAction(user, "approve")}>
              <CheckCircle2 size={18} />
              Approve
            </Button>
            <Button variant="danger" className="flex items-center justify-center gap-2" disabled={actionLoading === `reject-${user.id}`} onClick={() => onAction(user, "reject")}>
              <XCircle size={18} />
              Reject
            </Button>
          </>
        )}

        {user.status === "APPROVED" && !user.emailVerified && (
          <Button className="flex items-center justify-center gap-2" disabled={actionLoading === `resend-${user.id}`} onClick={() => onAction(user, "resend")}>
            <Mail size={18} />
            Resend Activation Email
          </Button>
        )}

        {user.status === "REJECTED" && (
          <Button className="flex items-center justify-center gap-2" disabled={actionLoading === `approve-${user.id}`} onClick={() => onAction(user, "approve")}>
            <CheckCircle2 size={18} />
            Approve User
          </Button>
        )}

        <Button variant="danger" className="flex items-center justify-center gap-2" disabled={actionLoading === `delete-${user.id}`} onClick={() => onAction(user, "delete")}>
          <Trash2 size={18} />
          Delete User
        </Button>
      </div>
    </Card>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-3">
      <p className="text-xs uppercase text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function FuturePanel({ icon: Icon, title, description }) {
  return (
    <Card className="rounded-lg p-8">
      <EmptyState icon={Icon} title={title} description={description} />
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-slate-800">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

function IconButton({ children, danger = false, loading = false, title, onClick }) {
  return (
    <button
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
        danger ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950" : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
      disabled={loading}
      onClick={onClick}
      title={title}
      type="button"
    >
      {loading ? <MoreHorizontal size={17} /> : children}
    </button>
  );
}

function StatusBadge({ status }) {
  return (
    <span
className={`
inline-flex
shrink-0
rounded-full
px-3
py-1
text-xs
font-semibold
${statusStyles[status]}
`}
>
      {status || "UNKNOWN"}
    </span>
  );
}

function UserAvatar({ name, size = "default" }) {
  const initials = name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dimensions = size === "large" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";

  return (
    <span className={`flex shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-semibold text-white ${dimensions}`}>
      {initials || "U"}
    </span>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}