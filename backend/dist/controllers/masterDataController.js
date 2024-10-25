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
exports.masterDataController = masterDataController;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
function masterDataController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allowedColumns = req.allowedColumns;
            if (!allowedColumns || allowedColumns.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No columns are allowed for you to access'
                });
            }
            // Construct the select object dynamically
            const selectFields = allowedColumns.reduce((acc, column) => {
                acc[column] = true;
                return acc;
            }, {});
            const data = yield prismaClient_1.default.masterData.findMany({
                select: selectFields,
            });
            return res.status(200).json({
                success: true,
                data: data
            });
        }
        catch (error) {
            console.error('Error fetching master data:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
