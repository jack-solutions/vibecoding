/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
}

/**
 * Validate name
 */
export function isValidName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 50;
}

/**
 * Validate role
 */
export function isValidRole(role: string): boolean {
    const validRoles = ["admin", "creator", "viewer", "advertiser"];
    return validRoles.includes(role);
}

/**
 * Sanitize user input (basic XSS prevention)
 */
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, "") // Remove angle brackets
        .substring(0, 1000); // Limit length
}

/**
 * Validate channel handle format
 */
export function isValidHandle(handle: string): boolean {
    const handleRegex = /^@[a-z0-9_-]{3,30}$/;
    return handleRegex.test(handle);
}

/**
 * Generate a unique handle from name
 */
export function generateHandleFromName(name: string): string {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 20);

    const random = Math.random().toString(36).substring(2, 8);
    return `@${base}${random}`;
}

/**
 * Validate request body has required fields
 */
export function validateRequiredFields(
    body: any,
    requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
    const missingFields = requiredFields.filter(
        (field) => !body[field] || body[field].toString().trim() === ""
    );

    return {
        isValid: missingFields.length === 0,
        missingFields,
    };
}
