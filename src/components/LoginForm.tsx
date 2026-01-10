import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { $isAuthLoading, loginUser } from "../store/authStore";
import { Input, Button, Card, CardHeader, CardBody, Divider } from "@heroui/react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLoading = useStore($isAuthLoading);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(email);
  };

  return (
    <div className="flex justify-center items-center py-10">
      <Card className="w-full max-w-[400px] shadow-2xl border border-divider">
        <CardHeader className="flex flex-col gap-1 items-start px-8 pt-8">
          <h1 className="text-2xl font-bold text-foreground">Login</h1>
          <p className="text-default-500 text-small">Enter your credentials to access the ledger</p>
        </CardHeader>
        <Divider className="my-2" />
        <CardBody className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}