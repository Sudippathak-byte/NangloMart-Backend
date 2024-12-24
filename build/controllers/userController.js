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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../database/models/userModel"));
const authMiddleware_1 = require("../middleware/authMiddleware");
class AuthController {
    static registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, email, password, role } = req.body;
            const userRole = role || authMiddleware_1.Role.Customer;
            if (!username || !email || !password) {
                res.status(400).json({
                    message: "Please provide username,email,password",
                });
                return;
            }
            yield userModel_1.default.create({
                username,
                email,
                password: bcrypt_1.default.hashSync(password, 12),
                role: userRole,
            });
            res.status(200).json({
                message: "User registered successfully",
            });
        });
    }
    static loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // user input
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({
                    message: "Please provide email,password",
                });
                return;
            }
            // check whether user with above email exist or not
            const [data] = yield userModel_1.default.findAll({
                where: {
                    email: email,
                },
            });
            if (!data) {
                res.status(404).json({
                    message: "No user with that email",
                });
                return;
            }
            // check password now
            const isMatched = bcrypt_1.default.compareSync(password, data.password);
            if (!isMatched) {
                res.status(403).json({
                    message: "Invalid password",
                });
                return;
            }
            // generate token
            const token = jsonwebtoken_1.default.sign({ id: data.id }, process.env.SECRET_KEY, {
                expiresIn: "20d",
            });
            res.status(200).json({
                message: "Logged in successfully",
                data: token,
                user: data,
            });
        });
    }
    static fetchUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield userModel_1.default.findAll();
            if (users.length > 0) {
                res.status(200).json({
                    message: "User fetched successfully",
                    data: users,
                });
            }
            else {
                res.status(404).json({
                    message: "you haven't any user ",
                    data: [],
                });
            }
        });
    }
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const result = yield userModel_1.default.destroy({
                    where: { id },
                });
                if (result === 0) {
                    res.status(404).json({
                        message: `User with this id not found.`,
                    });
                    return;
                }
                res.status(200).json({
                    message: "User deleted successfully",
                });
            }
            catch (error) {
                console.error("Error deleting user:", error);
                res.status(500).json({
                    message: "An error occurred while trying to delete the user.",
                });
            }
        });
    }
    static UpdateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, username, email, role } = req.body;
            // Validate that id, username, email, and role are provided
            if (!id || !username || !email || !role) {
                res.status(400).json({
                    message: "Please provide id, username, email, and role",
                });
                return;
            }
            try {
                // Check if the user exists by their id
                const existingUser = yield userModel_1.default.findByPk(id);
                if (!existingUser) {
                    res.status(404).json({
                        message: "User not found",
                    });
                    return;
                }
                // Check if the new email already exists in the system (if it's being updated)
                if (existingUser.email !== email) {
                    const emailExists = yield userModel_1.default.findOne({
                        where: {
                            email,
                        },
                    });
                    if (emailExists) {
                        res.status(400).json({
                            message: "Email is already taken by another user",
                        });
                        return;
                    }
                }
                // Prepare the data to update
                const updatedData = {
                    username,
                    email,
                    role,
                };
                // Only update the password if provided
                if (req.body.password) {
                    updatedData.password = bcrypt_1.default.hashSync(req.body.password, 12);
                }
                // Update the user in the database
                yield userModel_1.default.update(updatedData, {
                    where: {
                        id,
                    },
                });
                res.status(200).json({
                    message: "User updated successfully",
                });
            }
            catch (error) {
                console.error("Error in UpdateUser:", error);
                res.status(500).json({
                    message: "An error occurred while processing your request",
                });
            }
        });
    }
}
exports.default = AuthController;
