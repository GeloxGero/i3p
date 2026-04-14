import type {ArDetailResponse} from "../components/ArDetails/ArTypes.ts"




interface ArDetailErrorResponse {
    status: string;
    statusCode: number;
}



export const devFuncSeedArItem = async (detail : ArDetailResponse, arCode: string) : Promise<ArDetailErrorResponse | ArDetailResponse> => {


    if (!detail) return {status: "No detail found.", statusCode: 404};
    if (detail.remainingBudget <= 0) return {status: "No remaining budget", statusCode: 404};
    try {
        const res = await fetch(`/api/Ar/${encodeURIComponent(arCode)}/seed`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
            const msg = await res.text().catch(() => `HTTP ${res.status}`);
            return {status: "error seeding item", statusCode: 404};
        }
    } catch (e) {
        return {status: "error seeding item", statusCode: 404};
    }
    return detail;
}

