import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/auth.service.js";

import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.js";

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const result = await registerUser(data);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await loginUser(data);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};