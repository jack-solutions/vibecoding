import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

/**
 * Compare a plain text password with a hashed password
 * Uses constant-time comparison to prevent timing attacks
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error("Password comparison error:", error);
        return false;
    }
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid flag and error message
 */
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    message: string;
} {
    if (!password || password.length < 8) {
        return {
            isValid: false,
            message: "Password must be at least 8 characters long",
        };
    }

    if (password.length > 128) {
        return {
            isValid: false,
            message: "Password cannot exceed 128 characters",
        };
    }

    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
        return {
            isValid: false,
            message: "Password must contain at least one letter and one number",
        };
    }

    return {
        isValid: true,
        message: "Password is strong",
    };
}
