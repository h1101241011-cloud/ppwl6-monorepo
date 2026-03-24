import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

import { prisma } from "../prisma/db";
import type { ApiResponse, HealthCheck, User } from "shared";

const app = new Elysia()
  .use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        // tambah port frontend baru di sini
      ]
    })
  )
  .use(swagger())

  // Health check
  .get("/", (): ApiResponse<HealthCheck> => ({
    data: { status: "ok" },
    message: "server running"
  }))

  // GET semua user
  .get("/users", async (): Promise<ApiResponse<User[]>> => ({
    data: await prisma.user.findMany(),
    message: "User list retrieved"
  }))

  // GET user by ID
  .get("/user/:id", async ({ params }): Promise<ApiResponse<User | null>> => {
    const user = await prisma.user.findUnique({
      where: { id: Number(params.id) }
    });
    return { data: user, message: user ? "User found" : "User not found" };
  })

  // POST buat user baru
  .post("/user", async ({ body }): Promise<ApiResponse<User>> => {
    const { name, email } = body as { name: string; email: string };
    const user = await prisma.user.create({ data: { name, email } });
    return { data: user, message: "User created" };
  })

  // PUT update user
  .put("/user/:id", async ({ params, body }): Promise<ApiResponse<User>> => {
    const { name, email } = body as { name: string; email: string };
    const user = await prisma.user.update({
      where: { id: Number(params.id) },
      data: { name, email }
    });
    return { data: user, message: "User updated" };
  })

  // DELETE hapus user
  .delete("/user/:id", async ({ params }): Promise<ApiResponse<User>> => {
    const user = await prisma.user.delete({
      where: { id: Number(params.id) }
    });
    return { data: user, message: "User deleted" };
  })

  .listen(3000);

console.log(`🦊 Backend → http://localhost:${app.server?.port}`);
console.log(`📖 Swagger → http://localhost:${app.server?.port}/swagger`);

export type App = typeof app;