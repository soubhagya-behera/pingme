import api from "../api/axios";

const DashboardService = {

    getDashboard() {
        return api.get("/dashboard");
    }

};

export default DashboardService;