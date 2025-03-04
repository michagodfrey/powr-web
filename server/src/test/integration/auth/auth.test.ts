import request from "supertest";
import app from "../../../app";
import User from "../../../models/User";
import { generateTestToken, createTestUser } from "../../helpers/auth.helper";

describe("Authentication", () => {
  beforeEach(async () => {
    // Clear users before each test
    await User.destroy({ where: {} });
  });

  describe("GET /api/auth/google", () => {
    it("should redirect to Google OAuth", async () => {
      const response = await request(app).get("/api/auth/google").send();

      expect(response.status).toBe(302); // Redirect status
      expect(response.header.location).toContain("accounts.google.com");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return 401 if no token provided", async () => {
      const response = await request(app).get("/api/auth/me").send();

      expect(response.status).toBe(401);
    });

    it("should return user data if valid token provided", async () => {
      // Create a test user and generate token
      const user = await createTestUser();
      const token = generateTestToken(user);

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.user.email).toBe("test@example.com");
    });

    it("should return 401 if token is invalid", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .send();

      expect(response.status).toBe(401);
    });
  });
});
