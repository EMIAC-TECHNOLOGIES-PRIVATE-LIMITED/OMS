import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import 'dotenv/config';
import bcrypt from 'bcrypt';

const client = new PrismaClient();
const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'random@123';


export async function signUpController(req: Request, res: Response) {
    const body = req.body;

    try {
        const foundUser = await client.user.findUnique({
            where: {
                email: body.email,
            },
        });

        if (foundUser) {
            return res.status(409).json({ message: "Email ID already exists" });
        }

        const salt = await bcrypt.genSalt(saltRounds);
        const hashed = await bcrypt.hash(body.password, salt);


        const newUser = await client.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashed,
                role: body.role
            },
        });

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export async function signInController(req: Request, res: Response) {
    const { email, password } = req.body;

    try {

        const foundUser = await client.user.findUnique({
            where: { email },
        });

        if (!foundUser) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }


        const isPasswordValid = await bcrypt.compare(password, foundUser.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }


        const token = jwt.sign(
            { userId: foundUser.userId },
            jwtSecret,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}