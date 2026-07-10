export default function ProfileField({

    label,

    value

}){

    return(

        <div className="rounded-lg border border-[var(--border)] p-3">

            <p className="text-xs uppercase text-[var(--text-secondary)]">

                {label}

            </p>

            <p className="mt-1 font-medium">

                {value}

            </p>

        </div>

    );

}