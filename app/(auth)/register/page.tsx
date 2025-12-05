"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "viewer",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        setServerError("");
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        } else if (formData.name.trim().length > 50) {
            newErrors.name = "Name cannot exceed 50 characters";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (
            !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
        ) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
            newErrors.password = "Password must contain at least one letter and one number";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setServerError("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const { confirmPassword, ...registrationData } = formData;

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registrationData),
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to home on success
                router.push("/home");
                router.refresh();
            } else {
                setServerError(data.message || "Registration failed. Please try again.");
            }
        } catch (error) {
            setServerError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <svg
                        width="90"
                        height="20"
                        viewBox="0 0 90 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 0 14.285 0 14.285 0C14.285 0 5.35042 0 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C0 5.35042 0 10 0 10C0 10 0 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"
                            fill="#FF0000"
                        />
                        <path
                            d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z"
                            fill="white"
                        />
                    </svg>
                </div>

                <h1 className="auth-title">Create your Account</h1>
                <p className="auth-subtitle">to continue to YouTube Clone</p>

                {serverError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`form-input ${errors.name ? "form-input-error" : ""}`}
                            placeholder="Enter your full name"
                            disabled={isLoading}
                        />
                        {errors.name && <p className="error-message">{errors.name}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-input ${errors.email ? "form-input-error" : ""}`}
                            placeholder="Enter your email"
                            disabled={isLoading}
                        />
                        {errors.email && <p className="error-message">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="role" className="form-label">
                            I want to be a
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="form-select"
                            disabled={isLoading}
                        >
                            <option value="viewer">Viewer - Watch and enjoy videos</option>
                            <option value="creator">Creator - Upload and share videos</option>
                            <option value="advertiser">Advertiser - Promote your brand</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1.5">
                            {formData.role === "creator" && "A channel will be automatically created for you"}
                            {formData.role === "advertiser" && "You'll have access to ads manager"}
                            {formData.role === "viewer" && "You can upgrade to creator anytime"}
                        </p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`form-input ${errors.password ? "form-input-error" : ""}`}
                            placeholder="Create a password"
                            disabled={isLoading}
                        />
                        {errors.password && <p className="error-message">{errors.password}</p>}
                        {!errors.password && (
                            <p className="text-xs text-gray-500 mt-1.5">
                                Use 8 or more characters with letters and numbers
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`form-input ${errors.confirmPassword ? "form-input-error" : ""
                                }`}
                            placeholder="Confirm your password"
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <p className="error-message">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary mt-6"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <div className="divider">
                    <div className="divider-line"></div>
                    <span className="divider-text">or</span>
                    <div className="divider-line"></div>
                </div>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="auth-link">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-6 max-w-md w-full">
                <p className="text-xs text-center text-gray-500">
                    This is a demo YouTube clone project. Not affiliated with YouTube or Google.
                </p>
            </div>
        </div>
    );
}
