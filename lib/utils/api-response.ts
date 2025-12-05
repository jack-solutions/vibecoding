import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

/**
 * Success response helper
 */
export function successResponse<T>(
    message: string,
    data?: T,
    status: number = 200
): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            message,
            data,
        },
        { status }
    );
}

/**
 * Error response helper
 */
export function errorResponse(
    message: string,
    error?: string,
    status: number = 400
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            message,
            error,
        },
        { status }
    );
}

/**
 * Validation error response
 */
export function validationError(
    message: string,
    errors?: string[]
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            message,
            error: errors?.join(", "),
        },
        { status: 422 }
    );
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(
    message: string = "Unauthorized"
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status: 401 }
    );
}

/**
 * Forbidden response
 */
export function forbiddenResponse(
    message: string = "Forbidden"
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status: 403 }
    );
}

/**
 * Not found response
 */
export function notFoundResponse(
    message: string = "Not found"
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status: 404 }
    );
}

/**
 * Server error response
 */
export function serverError(
    message: string = "Internal server error"
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status: 500 }
    );
}
