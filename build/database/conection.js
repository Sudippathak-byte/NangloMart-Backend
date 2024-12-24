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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv = __importStar(require("dotenv"));
const userModel_1 = __importDefault(require("./models/userModel"));
const Category_1 = __importDefault(require("./models/Category"));
const Cart_1 = __importDefault(require("./models/Cart"));
const Order_1 = __importDefault(require("./models/Order"));
const Payment_1 = __importDefault(require("./models/Payment"));
const Product_1 = __importDefault(require("./models/Product"));
const OrderDetails_1 = __importDefault(require("./models/OrderDetails"));
const Review_1 = __importDefault(require("./models/Review"));
dotenv.config();
const sequelize = new sequelize_typescript_1.Sequelize({
    database: process.env.DB_NAME,
    dialect: "mysql",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    models: [__dirname + "/models"],
    logging: console.log,
});
console.log(process.env.DB_NAME);
console.log(process.env.DB_HOST);
sequelize
    .authenticate()
    .then(() => {
    console.log("connected");
})
    .catch((err) => {
    console.log(err);
});
sequelize.sync({ force: false, alter: false }).then(() => {
    console.log("Tables synced!");
});
//Relationship
userModel_1.default.hasMany(Product_1.default, { foreignKey: "userId" });
Product_1.default.belongsTo(userModel_1.default, { foreignKey: "userId" });
Category_1.default.hasOne(Product_1.default, { foreignKey: "categoryId" });
Product_1.default.belongsTo(Category_1.default, { foreignKey: "categoryId" });
// product-cart relation
userModel_1.default.hasMany(Cart_1.default, { foreignKey: "userId" });
Cart_1.default.belongsTo(userModel_1.default, { foreignKey: "userId" });
// user-cart relation
Product_1.default.hasMany(Cart_1.default, { foreignKey: "productId" });
Cart_1.default.belongsTo(Product_1.default, { foreignKey: "productId" });
// // order-orderdetail relation
Order_1.default.hasMany(OrderDetails_1.default, { foreignKey: "orderId" });
OrderDetails_1.default.belongsTo(Order_1.default, { foreignKey: "orderId" });
// orderdetail-product relation
Product_1.default.hasMany(OrderDetails_1.default, { foreignKey: "productId" });
OrderDetails_1.default.belongsTo(Product_1.default, { foreignKey: "productId" });
//order-payment relation
Payment_1.default.hasOne(Order_1.default, { foreignKey: "paymentId" });
Order_1.default.belongsTo(Payment_1.default, { foreignKey: "paymentId" });
//order-user relation
userModel_1.default.hasMany(Order_1.default, { foreignKey: "userId" });
Order_1.default.belongsTo(userModel_1.default, { foreignKey: "userId" });
//review -product relaation
Product_1.default.hasMany(Review_1.default, { foreignKey: "productId" });
Review_1.default.belongsTo(Product_1.default, { foreignKey: "productId" });
//review-use relation
userModel_1.default.hasMany(Review_1.default, { foreignKey: "userId" });
Review_1.default.belongsTo(userModel_1.default, { foreignKey: "productId" });
exports.default = sequelize;
