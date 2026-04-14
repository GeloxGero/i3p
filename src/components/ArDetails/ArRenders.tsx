
interface SectionFuncProps {
    title: string;
    children: React.ReactNode;
    subtle?: boolean;
}

export const Section = ({
                     title,
                     children,
                     subtle = false,
                 }:
   SectionFuncProps
) => {
    return (
        <div
            className={`rounded-xl border p-5 flex flex-col gap-3 ${subtle ? "border-dashed border-default-200 bg-default-50/50" : "border-default-200"}`}
        >
            <h2
                className={`text-sm font-semibold ${subtle ? "text-default-400" : "text-default-700"}`}
            >
                {title}
            </h2>
            {children}
        </div>
    );
}

interface DefFuncProps {
    label: string;
    value?: string | null;
    mono?: boolean;
    wide?: boolean;
}

export const Def = ({
                 label,
                 value,
                 mono = false,
                 wide = false,
             }: DefFuncProps) => {
    return (
        <div className={wide ? "col-span-2 sm:col-span-3" : ""}>
            <dt className="text-xs text-default-400 mb-0.5">{label}</dt>
            <dd className={`text-sm ${mono ? "font-mono" : ""} text-default-800`}>
                {value || <span className="text-default-300 italic">—</span>}
            </dd>
        </div>
    );
}

interface StatusBadgeFuncProps {
    status: number;
    verified: boolean;
}

export const StatusBadge = ({
                         status,
                         verified,
                     }: StatusBadgeFuncProps)=> {
    if (verified)
        return (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
				Verified
			</span>
        );
    if (status === 1)
        return (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
				Approved
			</span>
        );
    return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-default-100 text-default-500">
			Implemented
		</span>
    );
}



export const ErrorState = ({ message }: { message: string })=> {
    return (
        <div className="max-w-md mx-auto mt-20 text-center flex flex-col gap-4">
            <p className="text-4xl">🔍</p>
            <p className="text-default-500 text-sm">{message}</p>
            <a href="/projects" className="text-sm text-primary hover:underline">
                ← Back to Projects
            </a>
        </div>
    );
}