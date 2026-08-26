import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

async function registerAndLogin(email: string) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "User", email, password: "password123" });
  return res.body.token as string;
}

describe("Tasks", () => {
  it("creates a task for the authenticated user", async () => {
    const token = await registerAndLogin("owner@example.com");
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Write report" });
    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe("Write report");
    expect(res.body.task.status).toBe("todo");
    expect(res.body.task.priority).toBe("medium");
  });

  it("rejects task creation with missing title", async () => {
    const token = await registerAndLogin("owner2@example.com");
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "" });
    expect(res.status).toBe(400);
  });

  it("lists only the authenticated user's tasks", async () => {
    const tokenA = await registerAndLogin("a@example.com");
    const tokenB = await registerAndLogin("b@example.com");

    await request(app).post("/api/tasks").set("Authorization", `Bearer ${tokenA}`).send({ title: "A task" });
    await request(app).post("/api/tasks").set("Authorization", `Bearer ${tokenB}`).send({ title: "B task" });

    const res = await request(app).get("/api/tasks").set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe("A task");
  });

  it("prevents a user from reading, updating, or deleting another user's task", async () => {
    const tokenA = await registerAndLogin("owner3@example.com");
    const tokenB = await registerAndLogin("intruder@example.com");

    const create = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "Private task" });
    const taskId = create.body.task._id;

    const getRes = await request(app).get(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${tokenB}`);
    expect(getRes.status).toBe(404);

    const updateRes = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Hacked" });
    expect(updateRes.status).toBe(404);

    const deleteRes = await request(app).delete(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${tokenB}`);
    expect(deleteRes.status).toBe(404);
  });

  it("filters tasks by status and priority", async () => {
    const token = await registerAndLogin("filter@example.com");
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Low prio", priority: "low", status: "todo" });
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "High prio done", priority: "high", status: "done" });

    const res = await request(app)
      .get("/api/tasks?status=done&priority=high")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe("High prio done");
  });

  it("deletes a task owned by the requester", async () => {
    const token = await registerAndLogin("deleter@example.com");
    const create = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "To delete" });

    const res = await request(app)
      .delete(`/api/tasks/${create.body.task._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});
