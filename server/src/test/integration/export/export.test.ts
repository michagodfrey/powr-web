import request from "supertest";
import app from "../../../app";
import User from "../../../models/User";
import Exercise from "../../../models/Exercise";
import WorkoutSession from "../../../models/WorkoutSession";
import { generateTestToken, createTestUser } from "../../helpers/auth.helper";

describe("Export", () => {
  let user: User;
  let token: string;
  let exercise: Exercise;

  beforeEach(async () => {
    // Clear database
    await WorkoutSession.destroy({ where: {} });
    await Exercise.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create test user and exercise
    user = await createTestUser();
    token = generateTestToken(user);
    exercise = await Exercise.create({
      name: "Bench Press",
      userId: user.id,
    });

    // Create some test workouts
    await WorkoutSession.create({
      exerciseId: exercise.id,
      userId: user.id,
      date: new Date(),
      sets: [
        { weight: 100, reps: 5, unit: "kg" },
        { weight: 100, reps: 5, unit: "kg" },
      ],
      totalVolume: 1000,
    });
  });

  describe("GET /api/export/csv", () => {
    it("should export workout data as CSV", async () => {
      const response = await request(app)
        .get(`/api/export/csv?exerciseId=${exercise.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toContain("text/csv");
      expect(response.text).toContain("date,weight,reps,unit,totalVolume");
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app)
        .get(`/api/export/csv?exerciseId=${exercise.id}`)
        .send();

      expect(response.status).toBe(401);
    });

    it("should return 404 for non-existent exercise", async () => {
      const response = await request(app)
        .get("/api/export/csv?exerciseId=999999")
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/export/pdf", () => {
    it("should export workout data as PDF", async () => {
      const response = await request(app)
        .get(`/api/export/pdf?exerciseId=${exercise.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toContain("application/pdf");
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app)
        .get(`/api/export/pdf?exerciseId=${exercise.id}`)
        .send();

      expect(response.status).toBe(401);
    });

    it("should return 404 for non-existent exercise", async () => {
      const response = await request(app)
        .get("/api/export/pdf?exerciseId=999999")
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(response.status).toBe(404);
    });
  });
});
