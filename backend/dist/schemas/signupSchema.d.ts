import { z } from 'zod';
export declare const signupSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    roleId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    roleId: number;
}, {
    name: string;
    email: string;
    password: string;
    roleId: number;
}>;
export declare type SignupBody = z.infer<typeof signupSchema>;
