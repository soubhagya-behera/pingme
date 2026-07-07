import api from "../api/axios";

const AdminService = {
  getDashboardStats() {
    return api.get("/admin/dashboard");
  },

  getUsers({ status = "ALL", search = "", page = 0, size = 10 }) {
    return api.get("/admin/users", {
      params: {
        status,
        search,
        page,
        size,
      },
    });
  },

  approveUser(id) {
    return api.put(`/admin/approve/${id}`);
  },

  rejectUser(id) {
    return api.put(`/admin/reject/${id}`);
  },

  resendActivationEmail(id) {
    return api.put(`/admin/resend-activation/${id}`);
},

  deleteUser(id) {
    return api.delete(`/admin/users/${id}`);
  },
};

export default AdminService;
