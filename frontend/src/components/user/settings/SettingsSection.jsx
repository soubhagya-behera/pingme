export default function SettingsSection({

    title,

    description,

    children

}) {

    return (

        <div className="bg-white rounded-3xl border p-8 mb-8">

            <div className="mb-6">

                <h2 className="text-2xl font-semibold">

                    {title}

                </h2>

                <p className="text-slate-500 mt-1">

                    {description}

                </p>

            </div>

            {children}

        </div>

    );

}