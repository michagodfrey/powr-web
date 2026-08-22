// Auth routes — Supabase Auth handles login/signup/OAuth/token refresh directly
// from the client. The API only needs to serve the app-specific profile.
import { Router } from "express";
import { getCurrentUser } from "../controllers/authController";
import { validateJWT } from "../middleware/auth";

const router = Router();

router.get("/me", validateJWT, getCurrentUser);

export default router;
