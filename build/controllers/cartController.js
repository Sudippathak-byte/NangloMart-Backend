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
const Cart_1 = __importDefault(require("../database/models/Cart"));
const Product_1 = __importDefault(require("../database/models/Product"));
const Category_1 = __importDefault(require("../database/models/Category"));
class CartController {
    addToCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { quantity, productId } = req.body;
            console.log(productId);
            console.log(quantity);
            if (!quantity || !productId) {
                res.status(400).json({
                    message: "Please provide quantity,productId",
                });
            }
            // check if the the product alreay exists in the cart table or not
            let cartItem = yield Cart_1.default.findOne({
                where: {
                    productId,
                    userId,
                },
            });
            if (cartItem) {
                cartItem.quantity += quantity;
                yield cartItem.save();
            }
            else {
                // insert into Cart table
                cartItem = yield Cart_1.default.create({
                    quantity,
                    userId,
                    productId,
                });
            }
            const data = yield Cart_1.default.findAll({
                where: {
                    userId,
                },
            });
            res.status(200).json({
                message: "Product added to cart",
                data,
            });
        });
    }
    getMyCarts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const cartItems = yield Cart_1.default.findAll({
                where: {
                    userId,
                },
                include: [
                    {
                        model: Product_1.default,
                        include: [
                            {
                                model: Category_1.default,
                                attributes: ["id", "categoryName"],
                            },
                        ],
                    },
                ],
            });
            if (cartItems.length === 0) {
                res.status(404).json({
                    message: "No item in the cart",
                });
            }
            else {
                res.status(200).json({
                    message: "Cart items fetched succesfully",
                    data: cartItems,
                });
            }
        });
    }
    deleteMyCartItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { productId } = req.params;
            // check whether above productId product exist or not
            const product = yield Product_1.default.findByPk(productId);
            if (!product) {
                res.status(404).json({
                    message: "No product with that id",
                });
                return;
            }
            // delete that productId from userCart
            yield Cart_1.default.destroy({
                where: {
                    userId,
                    productId,
                },
            });
            res.status(200).json({
                message: "Product of cart deleted successfully",
            });
        });
    }
    updateCartItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { productId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { quantity } = req.body;
            if (!quantity) {
                res.status(400).json({
                    message: "Please provide quantity",
                });
                return;
            }
            const cartData = yield Cart_1.default.findOne({
                where: {
                    userId,
                    productId,
                },
            });
            if (cartData) {
                cartData.quantity = quantity;
                yield (cartData === null || cartData === void 0 ? void 0 : cartData.save());
                res.status(200).json({
                    message: "Product of cart updated successfully",
                    data: cartData,
                });
            }
            else {
                res.status(404).json({
                    message: "No productId of that userId",
                });
            }
        });
    }
}
exports.default = new CartController();
