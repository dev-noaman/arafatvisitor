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
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { SanitizePipe } from "./common/pipes/sanitize.pipe";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  // Security middleware: Helmet with CSP for inline styles (TailwindCSS)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https://static.cloudflareinsights.com"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          imgSrc: ["'self'", "data:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'", "https://cloudflareinsights.com"],
        },
      },
    }),
  );

  // Response compression middleware
  app.use(compression());

  // Cookie parser middleware
  app.use(cookieParser());

  // Increase body size limit for file uploads (CSV/XLSX imports)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Get the underlying Express instance
  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance();

  // Trust proxy for secure cookies behind nginx/reverse proxy in production
  if (process.env.NODE_ENV === "production") {
    expressApp.set("trust proxy", 1);
  }

  // Global exception filter (catch all errors)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global pipes for validation and sanitization
  app.useGlobalPipes(
    new SanitizePipe(),
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
      "https://arafatvisitor.cloud",
    ],
    credentials: true,
  });

  // Serve static files from public directory
  const publicPath = path.join(process.cwd(), "public");
  app.useStaticAssets(publicPath, { prefix: "/" });

  // Serve admin static files directly on Express (before SPA fallback) to ensure correct ordering
  const adminPath = path.join(publicPath, "admin");
  expressApp.use("/admin", express.static(adminPath));

  // SPA fallback for admin routes - serve index.html for client-side routing
  expressApp.get("/admin/*", (req: any, res: any, next: any) => {
    // Don't handle API routes
    if (req.path.startsWith("/admin/api")) {
      return next();
    }
    // Don't handle static file requests (let express.static serve them)
    if (/\.\w+$/.test(req.path)) {
      return next();
    }
    // Serve the SPA index.html for all other admin routes
    res.sendFile(path.join(adminPath, "index.html"), (err: any) => {
      if (err) {
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
