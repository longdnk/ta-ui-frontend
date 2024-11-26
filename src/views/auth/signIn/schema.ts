import * as z from "zod";

// Validation schema using zod
export const schema = z.object({
    info: z
        .string()
        .refine(
            (value) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^[a-zA-Z0-9_]+$/.test(value),
            {
                message: "Invalid email or username",
            }
        ),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});