"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
// require("./model/index");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
require("./database/conection");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoute_1 = __importDefault(require("./routes/productRoute"));
const adminSeeder_1 = __importDefault(require("./adminSeeder"));
const categoryController_1 = __importDefault(require("./controllers/categoryController"));
const categoryRoute_1 = __importDefault(require("./routes/categoryRoute"));
const cartRoute_1 = __importDefault(require("./routes/cartRoute"));
const orderRoute_1 = __importDefault(require("./routes/orderRoute"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const util_1 = require("util");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_cron_1 = __importDefault(require("node-cron"));
const userModel_1 = __importDefault(require("./database/models/userModel"));
const path_1 = __importDefault(require("path"));
app.use((0, cors_1.default)({
    origin: "*",
}));
node_cron_1.default.schedule("*/10 * * * *", () => {
    console.log("Task running every 10 minutes");
});
app.use(express_1.default.json());
// app.use(express.static("uploads"));
app.use(express_1.default.static(path_1.default.join(__dirname, "uploads")));
(0, adminSeeder_1.default)();
app.get("/", (req, res) => {
    res.send("sucess");
});
// localhost:8080/register
app.use("", userRoutes_1.default);
app.use("/admin/product", productRoute_1.default);
app.use("/admin/category", categoryRoute_1.default);
app.use("/customer/cart", cartRoute_1.default);
app.use("/order", orderRoute_1.default);
const server = app.listen(process.env.PORT, () => {
    categoryController_1.default.seedCategory();
    console.log(`Server running on port ${process.env.PORT}`);
    app;
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
io.on("connection", () => {
    console.log("A client connected");
});
let onlineUsers = [];
const addToOnlineUsers = (socketId, userId, role) => {
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    onlineUsers.push({ socketId, userId, role });
};
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("A client connected");
    const { token } = socket.handshake.auth;
    console.log(token);
    if (token) {
        //@ts-ignore
        const decoded = yield (0, util_1.promisify)(jsonwebtoken_1.default.verify)(token, process.env.SECRET_KEY);
        //@ts-ignore
        const doesUserExists = yield userModel_1.default.findByPk(decoded.id);
        if (doesUserExists) {
            addToOnlineUsers(socket.id, doesUserExists.id, doesUserExists.role);
        }
    }
    socket.on("updatedOrderStatus", ({ status, orderId, userId }) => {
        const findUser = onlineUsers.find((user) => user.userId == userId);
        if (findUser) {
            io.to(findUser.socketId).emit("statusUpdated", { status, orderId });
        }
    });
    socket.on("updatedPaymentStatus", ({ paymentStatus, orderId, userId }) => {
        const findUser = onlineUsers.find((user) => user.userId == userId);
        if (findUser) {
            io.to(findUser.socketId).emit("paymentStatusUpdated", {
                paymentStatus,
                orderId,
            });
        }
        else {
            console.log(`User with ID ${userId} not found in onlineUsers`);
        }
    });
    console.log(onlineUsers);
}));
// "dev": "nodemon",
//     "build": "rimraf ./build && tsc",
//     "start": "npm run build && node ./build/index.js"
