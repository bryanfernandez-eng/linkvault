"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { Link2, Eye, EyeOff } from "lucide-react"
import { loginWithEmail, registerWithEmail } from "../services/api"

interface LoginFormData {
  email: string
  password: string
}

interface RegisterFormData {
  name: string
  email: string
  password: string
}

function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
    reset,
    setError
  } = useForm<LoginFormData | RegisterFormData>()

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => loginWithEmail(data),
    onSuccess: () => {
      window.location.href = "/dashboard"
    },
    onError: (error: any) => {
      setError("password", {
        type: "manual",
        message: error.response?.data?.detail || "Invalid email or password"
      })
    }
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) => registerWithEmail(data),
    onSuccess: () => {
      window.location.href = "/dashboard"
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Registration failed"
      if (message.includes("Email already registered")) {
        setError("email", { type: "manual", message: "Email already registered" })
      } else {
        setError("password", { type: "manual", message })
      }
    }
  })

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/login"
  }

  const onSubmit = (data: any) => {
    if (isRegister) {
      registerMutation.mutate(data as RegisterFormData)
    } else {
      loginMutation.mutate(data as LoginFormData)
    }
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/30 via-slate-950/60 to-black"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800/30 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 ring-1 ring-white/5">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <Link2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent mb-2">
            LinkVault
          </h1>
          <p className="text-slate-200">
            {isRegister ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        <div className="space-y-6">
          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-6 py-4 border border-slate-700/30 rounded-xl shadow-lg bg-slate-800/50 backdrop-blur-sm text-sm font-medium text-slate-100 hover:bg-slate-700/50 hover:border-slate-600/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/60 text-slate-400">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...registerForm("name", { required: "Name is required" })}
                  className="w-full px-3 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 transition-all"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...registerForm("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className="w-full px-3 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 transition-all"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...registerForm("password", {
                    required: "Password is required",
                    minLength: isRegister
                      ? { value: 6, message: "Password must be at least 6 characters" }
                      : undefined
                  })}
                  className="w-full px-3 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 pr-10 transition-all"
                  placeholder={isRegister ? "Create a password (6+ characters)" : "Enter your password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending || registerMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 font-medium"
            >
              {loginMutation.isPending || registerMutation.isPending
                ? (isRegister ? "Creating Account..." : "Signing In...")
                : (isRegister ? "Create Account" : "Sign In")
              }
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="text-center">
            <p className="text-sm text-slate-400">
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <button
                onClick={toggleMode}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login