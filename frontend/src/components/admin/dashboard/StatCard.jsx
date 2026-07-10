import Card from "../../ui/Card";
import { useNavigate } from "react-router-dom";

export default function StatCard({

    title,

    value,

    icon: Icon,

    color = "text-indigo-600",

    path

}) {

    const navigate = useNavigate();

    return (

        <button

            onClick={() => navigate(path)}

            className="w-full text-left"

        >

            <Card className="group h-full cursor-pointer p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-xl">

                <div className="flex items-start justify-between">

                    <div>

                        <p className="text-sm text-[var(--text-secondary)]">

                            {title}

                        </p>

                        <h2 className="mt-3 text-4xl font-bold">

                            {value}

                        </h2>

                    </div>

                    <div className={`${color} transition-transform duration-300 group-hover:scale-110`}>

                        <Icon size={30} />

                    </div>

                </div>

            </Card>

        </button>

    );

}