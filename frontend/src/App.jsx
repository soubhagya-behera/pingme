import AppLayout from "./layout/AppLayout";
import Card from "./components/ui/Card";

function App(){

    return(

        <AppLayout>

            <Card
                className="p-8"
                hover
            >

                <h1 className="text-4xl font-bold">

                    Welcome to PingMe 🚀

                </h1>

                <p className="mt-4 text-slate-500">

                    Your Premium SaaS Chat Platform

                </p>

            </Card>

        </AppLayout>

    );

}

export default App;