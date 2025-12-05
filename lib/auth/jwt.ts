import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    channelId?: string;
}

/**
 * Sign a JWT access token
 * @param payload - User data to encode in token
 * @returns Signed JWT token
 */
export function signToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: "youtube-clone",
        audience: "youtube-clone-users",
    });
}

/**
 * Sign a JWT refresh token
 * @param payload - User data to encode in token
 * @returns Signed refresh token
 */
export function signRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: "youtube-clone",
        audience: "youtube-clone-users",
    });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: "youtube-clone",
            audience: "youtube-clone-users",
        }) as JWTPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.log("Token expired");
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.log("Invalid token");
        }
        return null;
    }
}

/**
 * Verify and decode a refresh token
 * @param token - Refresh token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
            issuer: "youtube-clone",
            audience: "youtube-clone-users",
        }) as JWTPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Decode a JWT token without verification (use carefully!)
 * @param token - JWT token to decode
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.decode(token) as JWTPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Get token expiration time in seconds
 * @returns Expiration time in seconds
 */
export function getTokenExpirationSeconds(): number {
    const expiry = JWT_EXPIRES_IN;
    if (expiry.endsWith("m")) {
        return parseInt(expiry) * 60;
    } else if (expiry.endsWith("h")) {
        return parseInt(expiry) * 60 * 60;
    } else if (expiry.endsWith("d")) {
        return parseInt(expiry) * 24 * 60 * 60;
    }
    return 900; // Default 15 minutes
}
