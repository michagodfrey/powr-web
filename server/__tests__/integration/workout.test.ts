import request from "supertest";
import { createApp } from "../../src/app";
import passport from "../../src/config/passport";
import { createTestUser, createTestExercise } from "../setup/factories";
import { Exercise } from "../../src/models/Exercise";
import { WorkoutSession } from "../../src/models/WorkoutSession";

const app = createApp(passport);

describe("Workout Flow Integration", () => {
  describe("Complete Workout Flow", () => {
    it("should create exercise, add workout, and retrieve history", async () => {
      // Create test user
      const user = await createTestUser();
      const authHeader = {
        "x-test-auth": JSON.stringify({
          id: user.id,
          email: user.email,
          preferredUnit: user.preferredUnit,
        }),
      };

      // 1. Create Exercise
      const exerciseRes = await request(app)
        .post("/api/exercises")
        .set(authHeader)
        .send({
          name: `Bench Press ${Date.now()}`,
          description: "Barbell bench press",
        });

      expect(exerciseRes.status).toBe(201);
      expect(exerciseRes.body.data.exercise).toHaveProperty("name");
      expect(exerciseRes.body.data.exercise).toHaveProperty("description");

      const exerciseId = exerciseRes.body.data.exercise.id;

      // 2. Add Workout Session
      const workoutRes = await request(app)
        .post("/api/workouts")
        .set(authHeader)
        .send({
          exerciseId,
          date: new Date().toISOString(),
          sets: [
            { weight: 100, reps: 5, unit: "kg" },
            { weight: 110, reps: 5, unit: "kg" },
            { weight: 120, reps: 5, unit: "kg" },
          ],
        });

      expect(workoutRes.status).toBe(201);
      expect(workoutRes.body.data.workoutSession).toHaveProperty("id");
      expect(workoutRes.body.data.workoutSession.totalVolume).toBe(1650); // (100+110+120) * 5

      // 3. Get Exercise History
      const historyRes = await request(app)
        .get(`/api/exercises/${exerciseId}`)
        .set(authHeader);

      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data.exercise.id).toBe(exerciseId);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid exercise creation", async () => {
      const user = await createTestUser();
      const authHeader = {
        "x-test-auth": JSON.stringify({
          id: user.id,
          email: user.email,
          preferredUnit: user.preferredUnit,
        }),
      };

      // Test with missing required field
      const response = await request(app)
        .post("/api/exercises")
        .set(authHeader)
        .send({
          description: "Test exercise",
          // name intentionally omitted
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("status", "error");
    });

    it("should handle invalid workout creation", async () => {
      const user = await createTestUser();
      const exercise = await createTestExercise({ userId: user.id });
      const authHeader = {
        "x-test-auth": JSON.stringify({
          id: user.id,
          email: user.email,
          preferredUnit: user.preferredUnit,
        }),
      };

      // Test with invalid weight (negative)
      const response = await request(app)
        .post("/api/workouts")
        .set(authHeader)
        .send({
          exerciseId: exercise.id,
          date: new Date().toISOString(),
          sets: [
            { weight: -100, reps: 5, unit: "kg" }, // Invalid: negative weight
          ],
        });

      expect(response.status).toBe(400); // Should be caught by validation before DB
      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message");
    });
  });
});
