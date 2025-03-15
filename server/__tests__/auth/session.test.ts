import request from "supertest";
import { createApp } from "../../src/app";
import passport from "../../src/config/passport";
import { createTestUser } from "../setup/factories";
import { User } from "../../src/models/User";
import { Exercise } from "../../src/models/Exercise";

// Create app instance for testing
const app = createApp(passport);

describe("Session Management", () => {
  describe("Authentication", () => {
    it("should return 401 when accessing protected route without auth", async () => {
      const response = await request(app).get("/api/exercises");
      expect(response.status).toBe(401);
    });

    it("should allow access to protected route with valid auth", async () => {
      // Create a test user
      const user = await createTestUser();

      // Create auth header with test user data
      const authHeader = {
        "x-test-auth": JSON.stringify({
          id: user.id,
          email: user.email,
          preferredUnit: user.preferredUnit,
        }),
      };

      const response = await request(app).get("/api/exercises").set(authHeader);

      expect(response.status).toBe(200);
    });
  });

  describe("Session Persistence", () => {
    it("should maintain user preferences across requests", async () => {
      // Create a test user with specific preferences
      const user = await createTestUser({
        preferredUnit: "lb",
      });

      const authHeader = {
        "x-test-auth": JSON.stringify({
          id: user.id,
          email: user.email,
          preferredUnit: user.preferredUnit,
        }),
      };

      // First request - create an exercise
      const exerciseResponse = await request(app)
        .post("/api/exercises")
        .set(authHeader)
        .send({
          name: "Test Exercise",
          description: "Test Description",
        });

      expect(exerciseResponse.status).toBe(201);

      // Second request - create a workout
      const workoutResponse = await request(app)
        .post("/api/workouts")
        .set(authHeader)
        .send({
          exerciseId: exerciseResponse.body.data.exercise.id,
          date: new Date().toISOString(),
          sets: [{ weight: 100, reps: 5 }],
        });

      expect(workoutResponse.status).toBe(201);
      // Verify the workout uses the user's preferred unit
      expect(workoutResponse.body.data.workoutSession.unit).toBe("lb");
    });

    it("should handle concurrent requests from same user", async () => {
      const user = await createTestUser();
      const authHeader = {
        "x-test-auth": JSON.stringify({
          id: user.id,
          email: user.email,
          preferredUnit: user.preferredUnit,
        }),
      };

      // Create multiple concurrent requests with unique names
      const requests = Array(5)
        .fill(null)
        .map((_, index) =>
          request(app)
            .post("/api/exercises")
            .set(authHeader)
            .send({
              name: `Exercise_${Date.now()}_${index}`,
              description: "Concurrent test",
            })
        );

      // Wait for all requests to complete
      const responses = await Promise.all(requests);

      // Verify all requests were successful
      responses.forEach((response) => {
        expect(response.status).toBe(201);
      });

      // Verify the correct number of exercises were created
      const userWithExercises = await User.findByPk(user.id, {
        include: [
          {
            model: Exercise,
            as: "exercises",
          },
        ],
      });

      const exercises = userWithExercises?.get("exercises") as Exercise[];
      expect(exercises?.length).toBe(5);
    });
  });

  describe("Session Cleanup", () => {
    it("should handle expired sessions gracefully", async () => {
      const user = await createTestUser();

      // Simulate an expired session by using an old timestamp
      const expiredAuth = {
        "x-test-auth": JSON.stringify({
          id: user.id,
          email: user.email,
          preferredUnit: user.preferredUnit,
          exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        }),
      };

      const response = await request(app)
        .get("/api/exercises")
        .set(expiredAuth);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Unauthorized");
    });
  });
});
