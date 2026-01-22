import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $token } from "../store/authStore";
import { Card, Avatar, Button, Spinner, Chip, Divider } from "@heroui/react";

export default function ProfileView() {
	const token = useStore($token);
	const [profile, setProfile] = useState<any>(null);

	useEffect(() => {
		const fetchProfile = async () => {
			if (!token) return;

			const res = await fetch("https://localhost:7000/api/Users/GetProfile", {
				headers: {
					// IMPORTANT: Send the token in the Authorization header
					Authorization: `Bearer ${token}`,
				},
			});

			if (res.ok) {
				setProfile(await res.json());
			}
		};

		fetchProfile();
	}, [token]);

	if (!profile) return <Spinner />;

	return (
		<Card className="max-w-[400px] mx-auto p-6 mt-10 shadow-xl border border-divider">
			<div className="flex flex-col items-center gap-4">
				<Avatar
					src={profile.photo}
					name={profile.name}
					className="w-24 h-24 text-large"
					isBordered
					color="primary"
				/>
				<div className="text-center">
					<h2 className="text-xl font-bold">{profile.name}</h2>
					<p className="text-default-500">{profile.email}</p>
				</div>
				<Chip
					color={profile.authority === 1 ? "warning" : "success"}
					variant="flat"
				>
					{profile.authority === 1 ? "Administrator" : "User"}
				</Chip>
			</div>

			<Divider className="my-6" />

			<Button
				color="danger"
				variant="flat"
				onPress={() => {
					localStorage.removeItem("token");
					window.location.href = "/login";
				}}
			>
				Logout
			</Button>
		</Card>
	);
}
