export default function SettingsSection({

    title,

    description,

    children

}) {

    return (

        <div className="settings-section bg-[var(--card)] text-[var(--text)] rounded-3xl border border-[var(--border)]">

            <div className="settings-section-heading">

                <h2 className="settings-section-title text-2xl font-semibold text-[var(--text)]">

                    {title}

                </h2>

                <p className="settings-section-description text-[var(--text-secondary)] mt-1">

                    {description}

                </p>

            </div>

            {children}

        </div>

    );

}
