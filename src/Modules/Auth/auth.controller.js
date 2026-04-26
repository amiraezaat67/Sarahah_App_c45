import  { Router } from "express";
import * as authService from "./auth.service.js";
import { responseFormatter } from "../../Middlewares/unified-response.middleware.js";
import { authenticate, validation } from "../../Middlewares/index.js";
import { registerSchema } from "../../Validators/auth.validators.js";
const authController = Router();

authController.post('/register', validation(registerSchema), responseFormatter(
    async (req, res) => {
        const result  = await authService.registerService(req.body);
        return { message: "User registered successfully", data: result , meta:{statusCode:201}};
    }
));

authController.put('/verify', responseFormatter(
    async (req, res) => {
        const result  = await authService.verifyEmailService(req.body);
        return { message: "Email verified successfully", data: result , meta:{statusCode:200}};
    }
));

authController.post('/login', responseFormatter(
    async (req, res) => {        
        const result  = await authService.loginService(req.body);
        return { message: "User logged in successfully", data: result , meta:{statusCode:200}};
    }
));

authController.post('/refresh-token', responseFormatter(
    async (req, res) => {
    const result  = await authService.refreshTokenService(req.headers);
    return { message: "Token refreshed successfully", data: result , meta:{statusCode:200}};
}));

authController.post('/gmail/register', responseFormatter(
    async (req, res) => {
        const result  = await authService.gmailRegisterService(req.body);
        return { message: "User registered successfully", data: result , meta:{statusCode:201}};
    }
));

authController.post('/gmail/login', responseFormatter(
    async (req, res) => {
        const result  = await authService.gmailLoginService(req.body);
        return { message: "User logged in successfully", data: result , meta:{statusCode:200}};
    }
));


authController.post('/logout', authenticate , responseFormatter(
    async (req, res) => {
        const result  = await authService.logoutService(req.accessTokenData , req.headers.refreshtoken);
        return { message: "User logged out successfully", data: result , meta:{statusCode:200}};
    }
))
export default authController;
