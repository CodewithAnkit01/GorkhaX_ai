import { ZodError } from "zod";

export const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A unique field already exists",
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
};