import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

import { useAuth } from "../../context/AuthProvider";
import { api } from "@/api/client";

type LoginResponse = {
  accessToken: string;
  admin: {
    id: number;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    address?: string | null;
    profile_img_path?: string | null;
    roles: string[];
    permissions: string[];
  };
};

export default function SignInForm() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [email, setEmail] = useState("superadmin@shop.com");
  const [password, setPassword] = useState("12345678");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0 && !isSubmitting;
  }, [email, password, isSubmitting]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<LoginResponse>("/admin/login", {
        email: email.trim(),
        password: password,
      });

      // ✅ persist based on "Keep me logged in"
      setSession(res.data.accessToken, res.data.admin, {
        persist: isChecked,
        notify: true,
      });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Login failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <div>
            <form onSubmit={onSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>

                  <Input
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    type="email"
                    name="email"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: any) => setPassword(e.target.value)}
                      name="password"
                      autoComplete="current-password"
                    />

                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>

                  <Link
                    to="/"
                    onClick={(e) => {
                      e.preventDefault();
                      toast("Forgot password coming soon");
                    }}
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div>
                  <Button className="w-full" size="sm" type="submit" disabled={!canSubmit}>
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* optional helper */}
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Demo: <span className="font-medium">superadmin@shop.com</span> /{" "}
            <span className="font-medium">12345678</span>
          </p>
        </div>
      </div>
    </div>
  );
}
