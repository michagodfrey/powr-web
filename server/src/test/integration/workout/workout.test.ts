import request from "supertest";
import app from "../../../app";
import User from "../../../models/User";
import Exercise from "../../../models/Exercise";
import WorkoutSession from "../../../models/WorkoutSession";
import { generateTestToken, createTestUser } from "../../helpers/auth.helper";

describe("Workout", () => {
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
  });

  describe("POST /api/workouts", () => {
    it("should create a new workout session", async () => {
      const workoutData = {
        exerciseId: exercise.id,
        date: new Date().toISOString(),
        sets: [
          { weight: 100, reps: 5, unit: "kg" },
          { weight: 100, reps: 5, unit: "kg" },
        ],
      };

      const response = await request(app)
        .post("/api/workouts")
        .set("Authorization", `Bearer ${token}`)
        .send(workoutData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.sets).toHaveLength(2);
      expect(response.body.totalVolume).toBe(1000); // 100kg * 5 reps * 2 sets
    });

    it("should return 401 if no token provided", async () => {
      const workoutData = {
        exerciseId: exercise.id,
        date: new Date().toISOString(),
        sets: [{ weight: 100, reps: 5, unit: "kg" }],
      };

      const response = await request(app)
        .post("/api/workouts")
        .send(workoutData);

      expect(response.status).toBe(401);
    });

    it("should return 400 if workout data is invalid", async () => {
      const invalidData = {
        exerciseId: exercise.id,
        date: new Date().toISOString(),
        sets: [], // Empty sets array should be invalid
      };

      const response = await request(app)
        .post("/api/workouts")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/workouts/exercise/:exerciseId", () => {
    it("should return workout history for an exercise", async () => {
      // Create some test workouts
      await WorkoutSession.create({
        exerciseId: exercise.id,
        userId: user.id,
        date: new Date(),
        sets: [{ weight: 100, reps: 5, unit: "kg" }],
        totalVolume: 500,
      });

      const response = await request(app)
        .get(`/api/workouts/exercise/${exercise.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].totalVolume).toBe(500);
    });

    it("should return 404 for non-existent exercise", async () => {
      const response = await request(app)
        .get("/api/workouts/exercise/999999")
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(response.status).toBe(404);
    });
  });
});
