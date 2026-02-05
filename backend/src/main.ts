// BigInt JSON serialization support (PostgreSQL IDs)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import * as path from "path";
import * as express from "express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Get the underlying Express instance
  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance();

  // Trust proxy for secure cookies behind nginx/reverse proxy in production
  if (process.env.NODE_ENV === "production") {
    expressApp.set("trust proxy", 1);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:5175",
      "http://127.0.0.1:5175",
      "http://localhost:5176",
      "http://127.0.0.1:5176",
    ],
    credentials: true,
  });

  // Serve static files from public directory
  const publicPath = path.join(process.cwd(), "public");
  app.useStaticAssets(publicPath, { prefix: "/" });

  // Serve TailAdmin static files from public/admin
  const adminPath = path.join(publicPath, "admin");
  app.use("/admin", express.static(adminPath));

  // SPA fallback for admin routes - serve index.html for client-side routing
  expressApp.get("/admin/*", (req: any, res: any, next: any) => {
    // Don't handle API routes
    if (req.path.startsWith("/admin/api")) {
      return next();
    }
    // Serve the SPA index.html for all other admin routes
    res.sendFile(path.join(adminPath, "index.html"), (err: any) => {
      if (err) {
        // If index.html doesn't exist yet (during development), continue to 404
        next();
      }
    });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`VMS Backend running at http://localhost:${port}`);
  console.log(`Admin panel at http://localhost:${port}/admin`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
