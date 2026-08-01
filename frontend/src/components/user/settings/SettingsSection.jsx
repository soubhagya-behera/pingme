export default function SettingsSection({

    title,

    description,

    children

}) {

    return (

        <div className="bg-[var(--card)] text-[var(--text)] rounded-3xl border border-[var(--border)] p-8 mb-8">

            <div className="mb-6">

                <h2 className="text-2xl font-semibold text-[var(--text)]">

                    {title}

                </h2>

                <p className="text-[var(--text-secondary)] mt-1">

                    {description}

                </p>

            </div>

            {children}

        </div>

    );

}
