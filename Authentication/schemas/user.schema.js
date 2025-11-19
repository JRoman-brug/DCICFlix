import z, { email } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const userSchema = z.object({
  email: z.email("The email is not valid"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginUserSchema = userSchema;
export const registerUserSchema = userSchema;
export const logoutUserSchema = z.object({
  id: z.regex(objectIdRegex, "Id not valid"),
  email: z.email("The email is not valid"),
});

export const refreshSchema = z.object({
  token: z.jwt("Is not a jwt valid"),
});
