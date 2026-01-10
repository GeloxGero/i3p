import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Filler,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { Card, CardHeader, CardBody, Divider, Image } from "@heroui/react";
import { Line } from "react-chartjs-2";

ChartJS.register(
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Filler
);

export function PieChart() {
	const pieChartData = {
		labels: ["PPA Approved", "Pending", "Under Review"],
		datasets: [
			{
				label: "Projects",
				data: [15, 8, 5],
				backgroundColor: [
					"rgba(34, 197, 94, 0.6)", // Success/Green
					"rgba(245, 158, 11, 0.6)", // Warning/Amber
					"rgba(59, 130, 246, 0.6)", // Primary/Blue
				],
				borderColor: [
					"rgba(34, 197, 94, 1)",
					"rgba(245, 158, 11, 1)",
					"rgba(59, 130, 246, 1)",
				],
				borderWidth: 1,
			},
		],
	};

	return (
		<Card className="w-full max-w-[400px] shadow-lg">
			<CardHeader className="flex flex-col items-start px-6 pt-6">
				<h4 className="text-large font-bold">Project Distribution</h4>
				<p className="text-small text-default-500">
					Current PPA Status Overview
				</p>
			</CardHeader>
			<Divider />
			<CardBody className="py-8 px-4 flex justify-center items-center">
				<div className="w-full h-[300px]">
					<Pie
						data={pieChartData}
						options={{
							maintainAspectRatio: false,
							plugins: {
								legend: {
									position: "bottom" as const,
								},
							},
						}}
					/>
				</div>
			</CardBody>
		</Card>
	);
}

export function BarGraph1() {
	const data = {
		labels: Array(20).fill(""), // Hidden labels for the sparkline effect
		datasets: [
			{
				fill: true,
				label: "Profits",
				data: [30, 45, 25, 60, 40, 50, 45, 30, 55, 100, 40, 20, 35, 20, 45, 60],
				borderColor: "#0095ff", // The blue line
				backgroundColor: (context: any) => {
					const chart = context.chart;
					const { ctx, chartArea } = chart;
					if (!chartArea) return null;
					const gradient = ctx.createLinearGradient(
						0,
						chartArea.top,
						0,
						chartArea.bottom
					);
					gradient.addColorStop(0, "rgba(0, 149, 255, 0.2)");
					gradient.addColorStop(1, "rgba(0, 149, 255, 0)");
					return gradient;
				},
				tension: 0.4, // Smooth curves
				borderWidth: 3,
				pointRadius: 0, // Hides points until hover
				pointHoverRadius: 6,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: { legend: { display: false } },
		scales: {
			x: { display: false }, // Hide axes for that clean look
			y: { display: false },
		},
	};

	return (
		<div className="p-8 bg-gray-50">
			<Card className="max-w-[400px] border-none shadow-sm overflow-hidden">
				<CardBody className="p-0">
					<div className="p-6 pb-3">
						<h2 className="text-3xl font-bold text-gray-800">$135,965</h2>
						<p className="text-gray-500 font-medium">Expenses</p>
					</div>
					<Divider />

					<div className="h-32 w-full mt-4">
						<Line data={data} options={options} />
					</div>
				</CardBody>
			</Card>
		</div>
	);
}

export function BarGraph2() {
	const data = {
		labels: Array(20).fill(""), // Hidden labels for the sparkline effect
		datasets: [
			{
				fill: true,
				label: "Revenue",
				// Values trending upward
				data: [10, 12, 15, 14, 20, 25, 22, 30, 45, 40, 55, 70, 65, 85, 95, 120],
				borderColor: "#10b981", // Emerald Green
				backgroundColor: (context: any) => {
					const { ctx, chartArea } = context.chart;
					if (!chartArea) return null;
					const gradient = ctx.createLinearGradient(
						0,
						chartArea.top,
						0,
						chartArea.bottom
					);
					gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
					gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
					return gradient;
				},
				tension: 0.4,
				borderWidth: 3,
				pointRadius: 0,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: { legend: { display: false } },
		scales: {
			x: { display: false }, // Hide axes for that clean look
			y: { display: false },
		},
	};

	return (
		<div className="p-8 bg-gray-50">
			<Card className="max-w-[400px] border-none shadow-sm overflow-hidden">
				<CardBody className="p-0">
					<div className="p-6 pb-3">
						<h2 className="text-3xl font-bold text-gray-800">$135,965</h2>
						<p className="text-gray-500 font-medium">Expenses</p>
					</div>
					<Divider />

					<div className="h-32 w-full mt-4">
						<Line data={data} options={options} />
					</div>
				</CardBody>
			</Card>
		</div>
	);
}

export function BarGraph3() {
	const data = {
		labels: Array(20).fill(""), // Hidden labels for the sparkline effect
		datasets: [
			{
				fill: true,
				label: "Market Vol",
				// High variance in numbers
				data: [80, 20, 90, 10, 70, 30, 85, 45, 20, 95, 40, 10, 100, 30, 50, 80],
				borderColor: "#f59e0b", // Amber/Orange
				backgroundColor: (context: any) => {
					const { ctx, chartArea } = context.chart;
					if (!chartArea) return null;
					const gradient = ctx.createLinearGradient(
						0,
						chartArea.top,
						0,
						chartArea.bottom
					);
					gradient.addColorStop(0, "rgba(245, 158, 11, 0.2)");
					gradient.addColorStop(1, "rgba(245, 158, 11, 0)");
					return gradient;
				},
				tension: 0.5, // Extra "curvy"
				borderWidth: 3,
				pointRadius: 0,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: { legend: { display: false } },
		scales: {
			x: { display: false }, // Hide axes for that clean look
			y: { display: false },
		},
	};

	return (
		<div className="p-8 bg-gray-50">
			<Card className="max-w-[400px] border-none shadow-sm overflow-hidden">
				<CardBody className="p-0">
					<div className="p-6 pb-3">
						<h2 className="text-3xl font-bold text-gray-800">$135,965</h2>
						<p className="text-gray-500 font-medium">Expenses</p>
					</div>
					<Divider />

					<div className="h-32 w-full mt-4">
						<Line data={data} options={options} />
					</div>
				</CardBody>
			</Card>
		</div>
	);
}

export default { PieChart, BarGraph1, BarGraph2, BarGraph3 };
