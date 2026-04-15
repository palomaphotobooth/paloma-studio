"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { authSchema, type AuthInput } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/providers/toast-provider";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState } = useForm<AuthInput>({ resolver: zodResolver(authSchema) });

  const onSubmit = async (values: AuthInput) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp(values);
    if (error) {
      setError(error.message);
      toast({ title: "Sign up failed", description: error.message, variant: "error" });
      return;
    }
    toast({ title: "Account created", description: "Welcome to ShortForge", variant: "success" });
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Start building with ShortForge</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" {...register("password")} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Have an account? <Link className="text-indigo-600" href="/auth/sign-in">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
