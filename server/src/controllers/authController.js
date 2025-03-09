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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getCurrentUser = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.isAuthenticated()) {
            return next(new errorHandler_1.AppError("Not authenticated", 401));
        }
        res.json(req.user);
    }
    catch (error) {
        next(error);
    }
});
exports.getCurrentUser = getCurrentUser;
const logout = (req, res) => {
    req.logout(() => {
        res.json({ status: "success" });
    });
};
exports.logout = logout;
