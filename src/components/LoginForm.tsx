
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Lock, Mail } from "lucide-react";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <Card className="w-full max-w-md glass-card animate-fade-in border-[#ea384c]/20">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-medium text-[#ea384c]">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to access your seafood order dashboard
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 glass-input"
                autoComplete="email"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 glass-input"
                autoComplete="current-password"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full group relative overflow-hidden bg-[#ea384c] hover:bg-[#ea384c]/90" 
            disabled={isLoading}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? "Signing In..." : "Sign In"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
