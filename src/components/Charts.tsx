import React, { useEffect, useState, useMemo } from "react";
import { $token } from "../../src/store/authStore";
import { useStore } from "@nanostores/react";
import { Spinner, Card, CardHeader, CardBody } from "@heroui/react";
import { Bar } from "react-chartjs-2";

// Make sure these are registered in your main file or here
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
);

export const DashboardCharts = () => {
	const selectedYear = "2026";
	const token = useStore($token);
	const [allPlans, setAllPlans] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchYearlyData = async () => {
			if (!token) return;
			setLoading(true);
			try {
				const res = await fetch(
					"http://localhost:5109/api/SchoolImplementation",
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);
				const data = await res.json();
				setAllPlans(Array.isArray(data) ? data : [data]);
			} catch (err) {
				console.error("Chart fetch error:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchYearlyData();
	}, [token]);

	// Aggregate items across all reports that match the selected year
	const monthlyCosts = useMemo(() => {
		const months = Array(12).fill(0);

		allPlans.forEach((plan) => {
			// Extract year from plan date if p.year doesn't exist
			const planYear =
				plan.year?.toString() || new Date(plan.date).getFullYear().toString();

			if (planYear === selectedYear && plan.items) {
				plan.items.forEach((item: any) => {
					if (item.date) {
						const m = new Date(item.date).getMonth();
						months[m] += item.estimatedCost || 0;
					}
				});
			}
		});
		return months;
	}, [allPlans, selectedYear]);

	if (loading) return <Spinner className="m-10" label="Generating chart..." />;

	return (
		<Card className="w-full shadow-sm border-none p-4">
			<CardHeader className="flex flex-col items-start px-6 pt-6">
				<p className="text-tiny uppercase font-bold text-primary">
					Budget Execution
				</p>
				<h4 className="text-xl font-bold">
					Total Cost Distribution ({selectedYear})
				</h4>
			</CardHeader>
			<CardBody className="h-[400px]">
				<Bar
					data={{
						labels: [
							"Jan",
							"Feb",
							"Mar",
							"Apr",
							"May",
							"Jun",
							"Jul",
							"Aug",
							"Sep",
							"Oct",
							"Nov",
							"Dec",
						],
						datasets: [
							{
								label: "Total Implementation Cost",
								data: monthlyCosts,
								backgroundColor: "rgba(0, 112, 240, 0.7)", // HeroUI Primary blue
								hoverBackgroundColor: "rgba(0, 112, 240, 0.9)",
								borderRadius: 6,
							},
						],
					}}
					options={{
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							legend: {
								display: true,
								position: "top" as const,
							},
							tooltip: {
								callbacks: {
									label: (context) => `₱${context.parsed.y?.toLocaleString()}`,
								},
							},
						},
						scales: {
							y: {
								beginAtZero: true,
								ticks: {
									callback: (value) => `₱${value.toLocaleString()}`,
								},
							},
						},
					}}
				/>
			</CardBody>
		</Card>
	);
};
