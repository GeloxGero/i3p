import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $isAuthLoading, $token, $userProfile } from "../store/authStore";
import {
	Input,
	Button,
	Card,
	CardHeader,
	CardBody,
	Divider,
} from "@heroui/react";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const isLoading = useStore($isAuthLoading);
	const [errMessage, setErrMessage] = useState("");

	useEffect(() => {
		const checkAuth = async () => {
			const currentToken = $token.get();
			if (currentToken) {
				try {
					const response = await fetch(
						"http://localhost:5109/api/user/GetProfile",
						{
							headers: { Authorization: `Bearer ${currentToken}` },
						},
					);

					if (!response.ok) {
						// Token is invalid or expired
						$token.set(null);
						$userProfile.set(null);
					}
				} catch (e) {
					console.error("Auth verification failed", e);
				}
			}
		};
		checkAuth();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault(); // Moved to the top to prevent page reload immediately
		$isAuthLoading.set(true);

		try {
			console.log({ email, password });
			const response = await fetch("http://localhost:5109/api/user/Login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (response.ok) {
				// 1. Update Nano Stores (our store handles localStorage syncing)
				$token.set(data.token);
				$userProfile.set(data.user);
				console.log($token);
				console.log($userProfile);

				// 2. Redirect
				window.location.href = "/";
			} else {
				setErrMessage("Invalid Login Credentials");
			}
		} catch (error) {
			console.error("Login Error:", error);
			setErrMessage("Cannot connect to server");
		} finally {
			$isAuthLoading.set(false);
		}
	};

	return (
		<div className="flex justify-center items-center py-10">
			<Card className="w-full max-w-[400px] shadow-2xl border border-divider flex align-center justify-center">
				<CardHeader className="flex flex-col gap-1 items-start px-8 pt-8">
					<h1 className="text-2xl font-bold text-foreground">Login</h1>
					<p className="text-default-500 text-small">
						Enter credentials to access the ledger
					</p>
				</CardHeader>
				<Divider className="my-2" />
				<CardBody className="px-8 pb-8">
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<h1>{errMessage}</h1>
						<Input
							label="Email"
							type="email"
							variant="bordered"
							value={email}
							onValueChange={setEmail}
							isDisabled={isLoading}
							isRequired
						/>
						<Input
							label="Password"
							type="password"
							variant="bordered"
							value={password}
							onValueChange={setPassword}
							isDisabled={isLoading}
							isRequired
						/>
						<Button
							type="submit"
							color="primary"
							className="mt-2 font-semibold"
							isLoading={isLoading}
						>
							Sign In
						</Button>
					</form>
				</CardBody>
				<a className="flex justify-center text-sm text-blue-500 hover:cursor-pointer">
					Forgot Password?
				</a>
				<a
					className="flex justify-center text-sm text-blue-500 hover:cursor-pointer pb-4"
					href="/register"
				>
					Create Account
				</a>
			</Card>
		</div>
	);
}
