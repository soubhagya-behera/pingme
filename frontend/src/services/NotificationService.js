import api from "../api/axios";

const NotificationService = {

    getNotifications() {

        return api.get("/notifications");

    },

    getUnreadCount() {

        return api.get("/notifications/unread-count");

    },

    markAsRead(id) {

        return api.put(`/notifications/${id}/read`);

    },

    markAllRead() {

        return api.put("/notifications/read-all");

    },

};

export default NotificationService;