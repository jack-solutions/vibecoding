import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@vc-yt-clone/db";

// ============================================
// Better-Auth Configuration
// ============================================

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "sqlite",
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
});

// ============================================
// Re-export all auth modules
// ============================================

// Types
export * from "./types";

// Permission utilities
export * from "./permissions";

// Middleware
export * from "./middleware";

// User profile service
export * from "./userProfileService";
