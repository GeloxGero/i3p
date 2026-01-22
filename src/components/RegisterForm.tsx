import React, { useState, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { $isAuthLoading, $authError } from "../store/authStore";
import {
	Input,
	Button,
	Card,
	CardHeader,
	CardBody,
	Divider,
	Alert,
} from "@heroui/react";

export default function RegisterForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const isLoading = useStore($isAuthLoading);
	const error = useStore($authError);

	// Validation: Check if passwords match
	const passwordsMatch = useMemo(() => {
		if (!confirmPassword) return true;
		return password === confirmPassword;
	}, [password, confirmPassword]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!passwordsMatch) {
			$authError.set("Passwords do not match");
			return;
		}

		$isAuthLoading.set(true);
		$authError.set(null);

		const payload = {
			Name: name,
			Email: email,
			PasswordHash: password, // The .NET controller hashes this plain text
			Authority: 0, // UserAuthority.NORMAL
			Photo: null,
		};

		try {
			const response = await fetch(
				"https://localhost:7000/api/Users/CreateUser",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				}
			);

			if (!response.ok) {
				const data = await response.json();
				$authError.set(data.message || "Registration failed");
			} else {
				alert("Account created successfully!");
				// Reset form or redirect
				setName("");
				setEmail("");
				setPassword("");
				setConfirmPassword("");
			}
		} catch (err) {
			$authError.set("Connection to server failed.");
		} finally {
			$isAuthLoading.set(false);
		}
	};

	return (
		<div className="flex justify-center items-center py-10 px-4">
			<Card className="w-full max-w-[400px] shadow-2xl border border-divider">
				<CardHeader className="flex flex-col gap-1 items-start px-8 pt-8">
					<h1 className="text-2xl font-bold text-foreground">Register</h1>
					<p className="text-default-500 text-small">Create your account</p>
				</CardHeader>
				<Divider className="my-2" />
				<CardBody className="px-8 pb-8">
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						{error && <Alert color="danger" variant="faded" title={error} />}

						<Input
							label="Full Name"
							variant="bordered"
							isRequired
							value={name}
							onValueChange={setName}
						/>

						<Input
							label="Email"
							type="email"
							variant="bordered"
							isRequired
							value={email}
							onValueChange={setEmail}
						/>

						<Input
							label="Password"
							type="password"
							variant="bordered"
							isRequired
							value={password}
							onValueChange={setPassword}
						/>

						<Input
							label="Confirm Password"
							type="password"
							variant="bordered"
							isRequired
							value={confirmPassword}
							onValueChange={setConfirmPassword}
							isInvalid={!passwordsMatch}
							errorMessage={!passwordsMatch ? "Passwords do not match" : ""}
						/>

						<Button
							type="submit"
							color="primary"
							className="mt-2 font-semibold"
							isLoading={isLoading}
							isDisabled={!passwordsMatch || !password || !email}
						>
							{isLoading ? "Creating Account..." : "Sign Up"}
						</Button>
					</form>
				</CardBody>
			</Card>
		</div>
	);
}
