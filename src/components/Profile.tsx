import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $token, $userProfile } from "../store/authStore";
import {
	Card,
	CardHeader,
	CardBody,
	Avatar,
	Divider,
	Chip,
	Button,
	Skeleton,
	CardFooter,
} from "@heroui/react";

export default function Profile() {
	const token = useStore($token);
	const [hasMounted, setHasMounted] = useState(false); // Add this
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<any>(null);

	// 1. Set mounted to true once we are in the browser
	useEffect(() => {
		setHasMounted(true);
	}, []);

	useEffect(() => {
		if (!hasMounted) return; // Don't fetch until we are in the browser

		const loadProfile = async () => {
			if (!token) {
				window.location.href = "/login";
				return;
			}

			try {
				const response = await fetch(
					"http://localhost:5109/api/user/GetProfile",
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);

				if (response.ok) {
					const data = await response.json();
					setProfile(data);
					$userProfile.set(data);
				} else {
					$token.set(null);
					window.location.href = "/login";
				}
			} catch (error) {
				console.error("Fetch error:", error);
			} finally {
				setLoading(false);
			}
		};

		loadProfile();
	}, [token, hasMounted]);

	// 2. Return a consistent loading state during SSR
	if (!hasMounted || loading) {
		return (
			<div className="max-w-[400px] mx-auto mt-10 p-4">
				<Card className="p-6 space-y-5">
					<Skeleton className="rounded-full w-24 h-24 mx-auto" />
					<div className="space-y-3">
						<Skeleton className="h-5 w-3/4 mx-auto rounded-lg" />
						<Skeleton className="h-4 w-1/2 mx-auto rounded-lg" />
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex justify-center items-center py-12 px-4">
			<Card className="w-full max-w-[400px] shadow-xl border border-divider">
				<CardHeader className="flex flex-col items-center gap-3 pt-8">
					<Avatar
						src={profile?.photo}
						className="w-24 h-24 text-large"
						isBordered
						color="primary"
					/>
					<div className="text-center">
						<h1 className="text-2xl font-bold text-foreground">
							{profile?.name}
						</h1>
						<p className="text-default-500 text-small">{profile?.email}</p>
					</div>
					<Chip
						color={profile?.authority === 1 ? "warning" : "success"}
						variant="flat"
						size="sm"
					>
						{profile?.authority === 1 ? "ADMINISTRATOR" : "NORMAL USER"}
					</Chip>
				</CardHeader>

				<Divider className="my-4 mx-8 w-auto" />

				<CardBody className="px-8 pb-4">
					<div className="flex flex-col gap-4">
						<div className="flex justify-between">
							<span className="text-default-500 text-small">Account Type</span>
							<span className="text-small font-medium">Standard Ledger</span>
						</div>
						<div className="flex justify-between">
							<span className="text-default-500 text-small">Status</span>
							<Chip size="sm" color="success" variant="dot">
								Verified
							</Chip>
						</div>
					</div>
				</CardBody>

				<CardFooter className="px-8 pb-8 pt-4">
					<Button
						fullWidth
						color="danger"
						variant="flat"
						className="font-semibold"
						onPress={() => {
							$token.set(null);
							window.location.href = "/login";
						}}
					>
						Log Out
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
