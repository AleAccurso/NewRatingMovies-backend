import { Router } from "express";
import * as authController from "controllers/authController"; 

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.delete("/logout", authController.logout);
router.get("/user", authController.getLoggedUser);

export default router;
