"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// TODO : remove cors and configure proxy from frontend
app.use((0, cors_1.default)());
const port = process.env.PORT || 3000;
app.get('/api/v1/health', (req, res) => {
    res.send('Perfect Health');
});
app.listen(port, () => {
    console.log(`Server Started at port : ${port}`);
});