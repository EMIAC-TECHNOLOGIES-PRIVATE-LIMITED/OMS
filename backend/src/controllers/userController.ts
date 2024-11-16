import prismaClient from "../utils/prismaClient";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { SignupBody, signupSchema } from "../schemas/signupSchema";
import { getAvailableRoles } from "../utils/getAvailabeRoles";
import { SigninBody, signinSchema } from "../schemas/signinSchema";
import { getPermissions } from "../utils/getPermissions";


const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'random@123';

export async function signUpController(req: Request, res: Response): Promise<Response> {

    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
    }

    const body: SignupBody = result.data;

    const userExist = await prismaClient.user.findUnique({
        where: {
            email: body.email
        }
    })

    if (userExist) {
        return res.status(501).json({
            message : "Email Id already in use. "
        })
    }

    const availableRoles = await getAvailableRoles();
    const roleIDs = availableRoles.map(role => role.id);
    if (!roleIDs.includes(body.roleId)) {
        return res.status(400).json({ error: "Invalid roleId received" });
    }

    try {

        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(body.password, salt);


        const newUser = await prismaClient.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
                roleId: body.roleId
            }
        });

        return res.status(201).json({
            userId: newUser.id,
            name: newUser.name,
            email: newUser.email
        });
    } catch (error) {
        console.error("User creation failed:", error);
        return res.status(500).json({
            error: "User creation failed",
            detail: error instanceof Error ? error.message : "Unknown error"
        });
    }
}


export async function signInController(req: Request, res: Response) {
    const result = signinSchema.safeParse(req.body);
    if(!result.success) {
        return res.status(400).json({ errors: result.error.errors });
    }
    
    const body: SigninBody = result.data;

    try {
        const userFound = await prismaClient.user.findUnique({
            where: { email : body.email },
            include: { role: true },
        });

        if (!userFound) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const passwordMatch = await bcrypt.compare(body.password, userFound.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const accessData = await getPermissions(userFound.id);

        // console.log(accessData);

        const token = jwt.sign({
            email: userFound.email,
            userId: userFound.id,
            role: userFound.role.name,
            permissions: accessData.permissions,
            resources: accessData.resources,
        }, process.env.JWT_SECRET!, { expiresIn: '12h' });

        return res.status(200).json({
            message: 'User logged in successfully',
            token,
        });
    } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({
            error: "Internal server error",
            detail: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
