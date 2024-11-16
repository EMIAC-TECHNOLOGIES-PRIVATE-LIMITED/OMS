"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpController = signUpController;
exports.signInController = signInController;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const signupSchema_1 = require("../schemas/signupSchema");
const getAvailabeRoles_1 = require("../utils/getAvailabeRoles");
const signinSchema_1 = require("../schemas/signinSchema");
const getPermissions_1 = require("../utils/getPermissions");
const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'random@123';
function signUpController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = signupSchema_1.signupSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }
        const body = result.data;
        const userExist = yield prismaClient_1.default.user.findUnique({
            where: {
                email: body.email
            }
        });
        if (userExist) {
            return res.status(501).json({
                message: "Email Id already in use. "
            });
        }
        const availableRoles = yield (0, getAvailabeRoles_1.getAvailableRoles)();
        const roleIDs = availableRoles.map(role => role.id);
        if (!roleIDs.includes(body.roleId)) {
            return res.status(400).json({ error: "Invalid roleId received" });
        }
        try {
            const salt = yield bcrypt_1.default.genSalt(saltRounds);
            const hashedPassword = yield bcrypt_1.default.hash(body.password, salt);
            const newUser = yield prismaClient_1.default.user.create({
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
        }
        catch (error) {
            console.error("User creation failed:", error);
            return res.status(500).json({
                error: "User creation failed",
                detail: error instanceof Error ? error.message : "Unknown error"
            });
        }
    });
}
function signInController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = signinSchema_1.signinSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }
        const body = result.data;
        try {
            const userFound = yield prismaClient_1.default.user.findUnique({
                where: { email: body.email },
                include: { role: true },
            });
            if (!userFound) {
                return res.status(401).json({ error: "Invalid email or password" });
            }
            const passwordMatch = yield bcrypt_1.default.compare(body.password, userFound.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: "Invalid email or password" });
            }
            const accessData = yield (0, getPermissions_1.getPermissions)(userFound.id);
            // console.log(accessData);
            const token = jsonwebtoken_1.default.sign({
                email: userFound.email,
                userId: userFound.id,
                role: userFound.role.name,
                permissions: accessData.permissions,
                resources: accessData.resources,
            }, process.env.JWT_SECRET, { expiresIn: '12h' });
            return res.status(200).json({
                message: 'User logged in successfully',
                token,
            });
        }
        catch (error) {
            console.error("Login failed:", error);
            return res.status(500).json({
                error: "Internal server error",
                detail: error instanceof Error ? error.message : "Unknown error"
            });
        }
    });
}
