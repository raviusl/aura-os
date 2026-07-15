import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = signInSchema
  .extend({
    fullName: z.string().min(1, "Full name is required"),
  })
  .strict();

export type SignUpInput = z.infer<typeof signUpSchema>;
