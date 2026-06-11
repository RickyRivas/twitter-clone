import { z } from "zod";

// --- Auth ---

export const loginSchema = z.object({
    email: z.string()
        .email("Please enter a valid email address")
        .min(5, "Email must be at least 5 characters")
        .max(64, "Email cannot exceed 64 characters"),
    password: z.string()
        .min(6, "Password must be at least 6 characters"),
});

export const registerNewUserSchema = z
    .object({
        username: z.string()
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username cannot exceed 20 characters")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
        email: z.string()
            .email("Please enter a valid email address")
            .min(5, "Email must be at least 5 characters")
            .max(64, "Email cannot exceed 64 characters"),
        password: z.string()
            .min(6, "Password must be at least 6 characters")
            .regex(/[A-Z]/, "Must contain an uppercase letter")
            .regex(/[0-9]/, "Must contain a number"),
        passwordConfirmed: z.string()
    })
    .refine((data) => data.password === data.passwordConfirmed, {
        message: "Passwords don't match",
        path: ["passwordConfirmed"]
    });

export const forgotPasswordSchema = z.object({
    email: z.string()
        .email("Please enter a valid email address")
        .min(5, "Email must be at least 5 characters")
        .max(64, "Email cannot exceed 64 characters"),
});

export const resetPasswordSchema = z
    .object({
        password: z.string()
            .min(6, "Password must be at least 6 characters")
            .regex(/[A-Z]/, "Must contain an uppercase letter")
            .regex(/[0-9]/, "Must contain a number"),
        passwordConfirmed: z.string()
    })
    .refine((data) => data.password === data.passwordConfirmed, {
        message: "Passwords don't match",
        path: ["passwordConfirmed"]
    });

// --- Settings ---

export const updateProfileSchema = z.object({
    display_name: z.string()
        .max(50, "Display name cannot exceed 50 characters")
        .optional(),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username cannot exceed 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
    bio: z.string()
        .max(160, "Bio cannot exceed 160 characters")
        .optional(),
    location: z.string()
        .max(30, "Location cannot exceed 30 characters")
        .optional(),
    website: z.string()
        .url("Please enter a valid URL")
        .max(100, "Website URL cannot exceed 100 characters")
        .optional()
        .or(z.literal('')),
});

export const updateAccountSchema = z.object({
    email: z.string()
        .email("Please enter a valid email address")
        .min(5, "Email must be at least 5 characters")
        .max(64, "Email cannot exceed 64 characters"),
});

export const deleteUserSchema = z.object({
    confirm: z.literal('confirm', {
        invalid_type_error: "Please type 'confirm' to delete your account",
        required_error: "Confirmation is required"
    })
});

// --- Posts ---

export const reportSchema = z.object({
    reason: z.enum([
        'spam',
        'harassment',
        'hate_speech',
        'misinformation',
        'explicit_content',
        'violence',
        'other'
    ], { required_error: "Please select a reason" }),
    details: z.string()
        .max(500, "Details cannot exceed 500 characters")
        .optional(),
});

// --- Validator ---

export async function validateForm(schema: z.ZodTypeAny, data: unknown) {
    const result = schema.safeParse(data);

    if (!result.success) return {
        errors: result.error.issues.map(issue => ({
            field: issue.path[0]?.toString() ?? '',
            message: issue.message
        }))
    };

    return {};
}