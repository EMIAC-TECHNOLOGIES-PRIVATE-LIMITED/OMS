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
exports.dataController = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
exports.dataController = {
    getData: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { resource } = req.params;
        const allowedColumns = req.permittedColumns;
        if (!allowedColumns || allowedColumns.length === 0) {
            return res.status(403).json({ success: false, message: 'No columns allowed for access' });
        }
        try {
            const selectFields = allowedColumns.reduce((acc, column) => (Object.assign(Object.assign({}, acc), { [column]: true })), {});
            // Type assertion to inform TypeScript about the dynamic key
            const data = yield prismaClient_1.default[resource].findMany({ select: selectFields });
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Error fetching data' });
        }
    })
};
