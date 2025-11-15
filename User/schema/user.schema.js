import z from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const userSchema = z.object({
  id: z.regex(objectIdRegex, "Id format not valid"),
  email: z.email("The email is not valid"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const getUserByEmailSchema = userSchema.partial();

export const createUserSchema = userSchema.partial();
export const updateUserSchema = userSchema.partial().omit({
  id: true,
});
export const paramsIdSchema = z.object({
  id: z.string().regex(objectIdRegex, "Id format not valid"),
});

export const paramsEmailSchema = z.object({
  email: z.email("El formato del email no es válido"),
});
