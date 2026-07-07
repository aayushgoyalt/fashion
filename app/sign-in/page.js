"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
      } else {
        toast.success("Welcome back to Aura");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF6EE] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        <div className="text-center">
          <Link href="/" className="font-heading text-5xl tracking-widest text-primary font-bold">
            AURA
          </Link>
          <p className="mt-3 text-sm text-muted-foreground tracking-wide uppercase">
            Sign in to your luxury account
          </p>
        </div>

        <div className="w-full bg-white border border-[#EAE2DC] p-8 rounded-2xl shadow-sm space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="border-[#EAE2DC] focus:border-camel focus:ring-camel rounded-md text-xs h-10"
                disabled={isLoading}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="border-[#EAE2DC] pr-10 focus:border-camel focus:ring-camel rounded-md text-xs h-10"
                  disabled={isLoading}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-coffee text-white py-3 rounded-md transition-colors flex items-center justify-center gap-2 mt-6 uppercase tracking-wider text-xs font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={14} />
                </>
              )}
            </Button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#EAE2DC]"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
              New to Aura?
            </span>
            <div className="flex-grow border-t border-[#EAE2DC]"></div>
          </div>

          <div className="text-center">
            <Link
              href="/sign-up"
              className="text-xs uppercase tracking-wider text-camel hover:text-terracotta font-bold transition-colors"
            >
              Create a Premium Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#FAF6EE]">
          <Loader2 className="animate-spin text-camel" size={32} />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
