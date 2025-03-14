import { Request, Response, NextFunction } from "express";

// Export workout data as CSV
export const exportWorkoutsCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(501).json({
      status: "error",
      message: "Export functionality is temporarily unavailable",
    });
  } catch (error) {
    next(error);
  }
};

// Export workout data as PDF
export const exportWorkoutsPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(501).json({
      status: "error",
      message: "Export functionality is temporarily unavailable",
    });
  } catch (error) {
    next(error);
  }
};
