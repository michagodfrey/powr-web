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
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const exportController_1 = require("../controllers/exportController");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
// Protect all routes with error handling
router.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield new Promise((resolve, reject) => {
            passport_1.default.authenticate("jwt", { session: false }, (err, user) => {
                if (err) {
                    return reject(err);
                }
                if (!user) {
                    return reject(new errorHandler_1.AppError("Authentication failed", 401));
                }
                req.user = user;
                resolve(user);
            })(req, res, next);
        });
        next();
    }
    catch (error) {
        next(error);
    }
}));
// Export workout data as CSV
router.get("/csv", exportController_1.exportWorkoutsCSV);
// Export workout data as PDF
router.get("/pdf", exportController_1.exportWorkoutsPDF);
exports.default = router;
