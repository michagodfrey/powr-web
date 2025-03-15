import request from "supertest";
import { createApp } from "../../src/app";
import passport from "../../src/config/passport";
import { createTestUser, createTestExercise } from "../setup/factories";

const app = createApp(passport);

describe("Authentication Security", () => {
  describe("Protected Routes", () => {
    it("should prevent access to protected routes without authentication", async () => {
      const protectedRoutes = [
        { method: "get", path: "/api/exercises" },
        { method: "post", path: "/api/exercises" },
        { method: "get", path: "/api/workouts" },
        { method: "post", path: "/api/workouts" },
      ];

      for (const route of protectedRoutes) {
        const method = route.method as "get" | "post";
        const response = await request(app)[method](route.path);
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty(
          "message",
          "Please log in to access this resource"
        );
      }
    });

    it("should prevent accessing other users' data", async () => {
      // Create two users
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      // Create exercise as user1
      const exercise = await createTestExercise({ userId: user1.id });

      // Try to access as user2
      const authHeader2 = {
        "x-test-auth": JSON.stringify({
          id: user2.id,
          email: user2.email,
          preferredUnit: user2.preferredUnit,
        }),
      };

      const response = await request(app)
        .get(`/api/exercises/${exercise.id}`)
        .set(authHeader2);

      expect(response.status).toBe(404); // Should return 404 to not leak information
    });
  });

  describe("Session Security", () => {
    it("should handle malformed authentication headers", async () => {
      const malformedHeaders = [
        { "x-test-auth": "not-json" },
        { "x-test-auth": JSON.stringify({ invalid: "data" }) },
        { "x-test-auth": JSON.stringify({ id: "not-a-number" }) },
      ];

      for (const header of malformedHeaders) {
        const response = await request(app).get("/api/exercises").set(header);

        expect(response.status).toBe(401);
      }
    });

    it("should prevent session fixation", async () => {
      // Create a user and get their session
      const user = await createTestUser();
      const sessionId = "test-session-123";
      const authHeader = {
        "x-test-auth": JSON.stringify({
          id: user.id,
          email: user.email,
          preferredUnit: user.preferredUnit,
          sessionId: sessionId,
        }),
        "x-session-id": sessionId,
      };

      // Make a successful request
      const response1 = await request(app)
        .get("/api/exercises")
        .set(authHeader);

      expect(response1.status).toBe(200);

      // Try to reuse the same session with a different user
      const evilHeader = {
        "x-test-auth": JSON.stringify({
          id: user.id + 1, // Different user
          email: "evil@example.com",
          preferredUnit: "kg",
          sessionId: "evil-session-456", // Different session ID
        }),
        "x-session-id": sessionId, // Try to reuse original session
      };

      const response2 = await request(app)
        .get("/api/exercises")
        .set(evilHeader);

      expect(response2.status).toBe(401);
    });
  });

  describe("Input Validation", () => {
    it("should sanitize potentially malicious input", async () => {
      const user = await createTestUser();
      const authHeader = {
        "x-test-auth": JSON.stringify({
          id: user.id,
          email: user.email,
          preferredUnit: user.preferredUnit,
        }),
      };

      const maliciousInput = {
        name: '<script>alert("xss")</script>Squat',
        description: 'javascript:alert("xss")',
      };

      const response = await request(app)
        .post("/api/exercises")
        .set(authHeader)
        .send(maliciousInput);

      expect(response.status).toBe(201);
      expect(response.body.data.exercise.name).not.toContain("<script>");
      expect(response.body.data.exercise.description).not.toContain(
        "javascript:"
      );
    });
  });
});
