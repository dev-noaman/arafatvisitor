/* eslint-disable @typescript-eslint/no-var-requires */
// Dynamic requires are used throughout for AdminJS ESM compatibility

// BigInt JSON serialization support (PostgreSQL IDs)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { PrismaService } from "./prisma/prisma.service";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import * as path from "path";
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  // Get the underlying Express instance
  // NOTE: Do NOT add global body-parser here - it conflicts with AdminJS
  // Body parsing is handled per-route where needed (e.g., jsonParser for send-qr)
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

  // Serve custom admin CSS (sidebar visibility)
  app.useStaticAssets(path.join(process.cwd(), "public"), { prefix: "/" });

  // Add no-cache middleware for AdminJS routes to prevent stale bundles
  const httpAdapterForCache = app.getHttpAdapter();
  const expressAppForCache = httpAdapterForCache.getInstance();
  expressAppForCache.use("/admin", (req: any, res: any, next: any) => {
    // Set aggressive no-cache headers for all AdminJS routes
    res.setHeader(
      "Cache-Control",
      "no-cache, no-store, must-revalidate, max-age=0",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store"); // For CDNs like Cloudflare
    next();
  });

  // Setup AdminJS with dynamic import (ESM modules)
  try {
    const AdminJS = (await import("adminjs")).default;
    const AdminJSExpressModule = await import("@adminjs/express");
    const AdminJSExpress = AdminJSExpressModule.default || AdminJSExpressModule;
    // @ts-expect-error - moduleResolution mismatch with ESM package
    const AdminJSPrisma = await import("@adminjs/prisma");
    const { ComponentLoader } = await import("adminjs");

    AdminJS.registerAdapter({
      Database: AdminJSPrisma.Database,
      Resource: AdminJSPrisma.Resource,
    });

    const prisma = app.get(PrismaService);
    const cookieSecret =
      process.env.ADMINJS_COOKIE_SECRET || "adminjs-secret-change-me-32chars";

    // For Prisma 5.x+, use _runtimeDataModel; for older, use _baseDmmf
    const runtimeModel = (prisma as any)._runtimeDataModel;

    // If runtimeModel exists (Prisma 5+), transform it for AdminJS
    if (runtimeModel && runtimeModel.models) {
      const models = Object.entries(runtimeModel.models).map(
        ([name, model]: [string, any]) => ({
          name,
          fields: model.fields.map((f: any) => ({
            name: f.name,
            kind: f.kind,
            type: f.type,
            isRequired: f.isRequired,
            isList: f.isList,
            isUnique: f.isUnique,
            isId: f.isId,
            relationName: f.relationName,
          })),
        }),
      );

      // Patch _baseDmmf for AdminJS compatibility
      (prisma as any)._baseDmmf = {
        datamodel: { models },
        datamodelEnumMap: runtimeModel.enums || {},
      };
    }

    const getModel = (name: string) =>
      (prisma as any)._baseDmmf?.datamodel?.models?.find(
        (m: any) => m.name === name,
      );

    if (!getModel("User")) {
      console.log("DMMF patch failed, models not available");
      throw new Error("Could not patch Prisma DMMF for AdminJS");
    }

    // Setup ComponentLoader for custom components
    // Use process.cwd() so components are loaded from src/ (Nest does not copy .tsx to dist)
    const componentLoader = new ComponentLoader();
    const componentsDir = path.join(
      process.cwd(),
      "src",
      "admin",
      "components",
    );

    const Components = {
      Dashboard: componentLoader.add(
        "Dashboard",
        path.join(componentsDir, "Dashboard"),
      ),
      SendQrModal: componentLoader.add(
        "SendQrModal",
        path.join(componentsDir, "SendQrModal"),
      ),
      ChangePasswordModal: componentLoader.add(
        "ChangePasswordModal",
        path.join(componentsDir, "ChangePasswordModal"),
      ),
      ChangePasswordPage: componentLoader.add(
        "ChangePasswordPage",
        path.join(componentsDir, "ChangePasswordPage"),
      ),
      EditProfilePanel: componentLoader.add(
        "EditProfilePanel",
        path.join(componentsDir, "EditProfilePanel"),
      ),
      ReportsPanel: componentLoader.add(
        "ReportsPanel",
        path.join(componentsDir, "ReportsPanel"),
      ),
      SettingsPanel: componentLoader.add(
        "SettingsPanel",
        path.join(componentsDir, "SettingsPanel"),
      ),
      VisitorCards: componentLoader.add(
        "VisitorCards",
        path.join(componentsDir, "VisitorCards"),
      ),
      BulkImportHosts: componentLoader.add(
        "BulkImportHosts",
        path.join(componentsDir, "BulkImportHosts"),
      ),
      DeliveryShow: componentLoader.add(
        "DeliveryShow",
        path.join(componentsDir, "DeliveryShow"),
      ),
    };
    componentLoader.override("LoggedIn", path.join(componentsDir, "LoggedIn"));
    componentLoader.override(
      "SidebarPages",
      path.join(componentsDir, "SidebarPages"),
    );
    componentLoader.override(
      "SidebarResourceSection",
      path.join(componentsDir, "SidebarResourceSection"),
    );
    componentLoader.override("Login", path.join(componentsDir, "Login"));

    // Generate unique bundle hash on each server start to bust browser cache
    const bundleHash = `v${Date.now()}`;

    const admin = new AdminJS({
      rootPath: "/admin",
      loginPath: "/admin/login",
      logoutPath: "/admin/logout",
      componentLoader,
      bundler: {
        // Force unique bundle URLs on each deployment
        // @ts-expect-error - bundleHash is supported but not in types
        bundleHash,
      },
      branding: {
        companyName: "Arafat VMS",
        logo: false as const,
        favicon: "/favicon.ico",
        withMadeWithLove: false,
      },
      dashboard: {
        component: Components.Dashboard,
      },
      pages: {
        ChangePassword: {
          component: Components.ChangePasswordPage,
          icon: "Key",
        },
        EditProfile: {
          component: Components.EditProfilePanel,
          icon: "Edit",
        },
        Reports: {
          component: Components.ReportsPanel,
          icon: "BarChart2",
        },
        Settings: {
          component: Components.SettingsPanel,
          icon: "Settings",
        },
      },
      assets: {
        styles: ["/admin-custom.css"],
        scripts: ["/admin-scripts.js"],
      },
      resources: [
        // Hosts Resource
        {
          resource: { model: getModel("Host"), client: prisma },
          options: {
            id: "Hosts",
            navigation: { name: "Operations", icon: "Briefcase" },
            // Removed 'status' from list - table now shows only essential columns
            listProperties: ["name", "company", "email", "phone", "location"],
            filterProperties: ["company", "location"],
            editProperties: [
              "name",
              "company",
              "email",
              "phone",
              "location",
              "password",
            ],
            properties: {
              id: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              externalId: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: false,
                  filter: false,
                },
              },
              // Hide status completely - not needed in UI
              status: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: false,
                  filter: false,
                },
              },
              deletedAt: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: false,
                  filter: false,
                },
              },
              createdAt: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              updatedAt: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              // Virtual password field for updating linked User's password
              password: {
                type: "password",
                isVisible: {
                  list: false,
                  edit: true,
                  show: false,
                  filter: false,
                },
                description:
                  "Set or change password for this host's login account",
              },
            },
            sort: { sortBy: "company", direction: "asc" as const },
            actions: {
              bulkImport: {
                actionType: "resource" as const,
                label: "Bulk Import",
                icon: "Upload",
                component: Components.BulkImportHosts,
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
              },
              new: {
                // Only ADMIN can create hosts
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
                after: async (response: any, request: any, context: any) => {
                  const { record } = response;
                  const password = request.payload?.password;
                  const hostId = BigInt(record.params.id);
                  const hostEmail = record.params.email;
                  const hostName = record.params.name;

                  const userEmail = hostEmail || `host_${hostId}@system.local`;

                  // Check if user already exists with this email
                  const existingUser = await prisma.user.findUnique({
                    where: { email: userEmail.toLowerCase() },
                  });

                  if (!existingUser) {
                    // Use provided password or generate random one
                    const finalPassword =
                      password && password.trim()
                        ? password
                        : crypto.randomBytes(16).toString("hex");
                    const hashedPassword = await bcrypt.hash(finalPassword, 12);

                    await prisma.user.create({
                      data: {
                        email: userEmail.toLowerCase(),
                        password: hashedPassword,
                        name: hostName,
                        role: "HOST",
                        hostId,
                      },
                    });
                  }

                  return response;
                },
              },
              edit: {
                // Only ADMIN can edit hosts
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
                after: async (response: any, request: any, context: any) => {
                  const { record } = response;
                  const password = request.payload?.password;

                  // If password provided, update or create linked User
                  if (password && password.trim()) {
                    const hostId = BigInt(record.params.id);
                    const hostEmail = record.params.email;
                    const hostName = record.params.name;

                    // Find existing user linked to this host
                    const user = await prisma.user.findFirst({
                      where: { hostId },
                    });

                    const hashedPassword = await bcrypt.hash(password, 12);

                    if (user) {
                      // Update existing user's password
                      await prisma.user.update({
                        where: { id: user.id },
                        data: { password: hashedPassword },
                      });
                    } else {
                      // Create new user for this host
                      const userEmail =
                        hostEmail || `host_${hostId}@system.local`;
                      await prisma.user.create({
                        data: {
                          email: userEmail.toLowerCase(),
                          password: hashedPassword,
                          name: hostName,
                          role: "HOST",
                          hostId,
                        },
                      });
                    }
                  }

                  return response;
                },
              },
              delete: {
                // Only ADMIN can delete hosts - RECEPTION cannot delete
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
              },
              bulkDelete: {
                // Only ADMIN can bulk delete hosts - RECEPTION cannot delete
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
              },
              show: {
                // Everyone can view host details
                isAccessible: true,
              },
              list: {
                before: async (request: any, context: any) => {
                  const { currentAdmin } = context;
                  if (currentAdmin?.role === "HOST" && currentAdmin?.hostId) {
                    const host = await prisma.host.findUnique({
                      where: { id: BigInt(currentAdmin.hostId) },
                    });
                    if (host) {
                      request.query = {
                        ...request.query,
                        "filters.company": host.company,
                      };
                    }
                  }
                  return request;
                },
              },
            },
          },
        },
        // Deliveries Resource
        {
          resource: { model: getModel("Delivery"), client: prisma },
          options: {
            id: "Deliveries",
            navigation: { name: "Operations", icon: "Package" },
            listProperties: [
              "courier",
              "recipient",
              "hostId",
              "location",
              "status",
              "receivedAt",
              "pickedUpAt",
            ],
            filterProperties: ["status", "location", "receivedAt"],
            editProperties: [
              "hostId",
              "courier",
              "recipient",
              "notes",
              "location",
            ],
            properties: {
              id: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              hostId: {
                type: "reference" as const,
                reference: "Hosts",
                isVisible: { list: true, edit: true, filter: true, show: true },
              },
              status: {
                isVisible: {
                  list: true,
                  edit: false,
                  show: true,
                  filter: true,
                },
              },
              createdAt: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              receivedAt: {
                isVisible: {
                  list: true,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              pickedUpAt: {
                isVisible: {
                  list: true,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              receivedById: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: false,
                  filter: false,
                },
              },
            },
            actions: {
              show: {
                component: Components.DeliveryShow,
              },
              new: {
                isAccessible: ({ currentAdmin }: any) => {
                  const role = currentAdmin?.role;
                  return role === "ADMIN" || role === "RECEPTION";
                },
                before: async (request: any) => {
                  // Set default status and receivedAt on create
                  if (request.payload) {
                    request.payload.status = "RECEIVED";
                    request.payload.receivedAt = new Date().toISOString();
                  }
                  return request;
                },
              },
              edit: {
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
              },
              delete: {
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
              },
              markPickedUp: {
                actionType: "record" as const,
                label: "Mark Picked Up",
                icon: "CheckCircle",
                guard:
                  "Are you sure you want to mark this delivery as picked up?",
                isVisible: true,
                isAccessible: ({ currentAdmin, record }: any) => {
                  const role = currentAdmin?.role;
                  const status = record?.params?.status;
                  if (status !== "RECEIVED") return false;
                  if (role === "RECEPTION") return false;
                  if (role === "ADMIN") return true;
                  if (role === "HOST") {
                    return (
                      record?.params?.hostId?.toString() ===
                      currentAdmin?.hostId?.toString()
                    );
                  }
                  return false;
                },
                handler: async (request: any, response: any, context: any) => {
                  const { record } = context;
                  if (record.params.status !== "RECEIVED") {
                    return {
                      record: record.toJSON(),
                      notice: {
                        type: "error",
                        message: "Invalid state transition",
                      },
                    };
                  }
                  await record.update({
                    status: "PICKED_UP",
                    pickedUpAt: new Date(),
                  });
                  return {
                    record: record.toJSON(),
                    notice: { type: "success", message: "Marked as picked up" },
                  };
                },
              },
              list: {
                before: async (request: any, context: any) => {
                  try {
                    const { currentAdmin } = context;
                    if (currentAdmin?.role === "HOST" && currentAdmin?.hostId) {
                      request.query = {
                        ...request.query,
                        "filters.hostId": currentAdmin.hostId,
                      };
                    }
                  } catch (err) {
                    console.error("Deliveries list before hook error:", err);
                  }
                  return request;
                },
              },
            },
          },
        },
        // Visitors Resource (Visit with CHECKED_IN, CHECKED_OUT)
        {
          resource: { model: getModel("Visit"), client: prisma },
          options: {
            id: "Visitors",
            navigation: { name: "Operations", icon: "UserCheck" },
            listProperties: [
              "visitorName",
              "visitorPhone",
              "hostId",
              "purpose",
              "status",
              "checkInAt",
            ],
            filterProperties: ["status", "location", "checkInAt"],
            editProperties: [
              "visitorName",
              "visitorCompany",
              "visitorPhone",
              "visitorEmail",
              "hostId",
              "purpose",
              "location",
            ],
            properties: {
              id: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              sessionId: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              hostId: {
                type: "reference" as const,
                reference: "Hosts",
                isVisible: { list: true, edit: true, filter: true, show: true },
              },
              status: {
                isVisible: {
                  list: true,
                  edit: false,
                  show: true,
                  filter: true,
                },
              },
              checkInAt: {
                isVisible: {
                  list: true,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              checkOutAt: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              createdAt: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              updatedAt: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              preRegisteredById: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: false,
                  filter: false,
                },
              },
            },
            actions: {
              new: {
                isAccessible: ({ currentAdmin }: any) => {
                  const role = currentAdmin?.role;
                  return role === "ADMIN" || role === "RECEPTION";
                },
              },
              edit: {
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
              },
              checkout: {
                actionType: "record" as const,
                label: "Check Out",
                icon: "LogOut",
                guard: "Check out this visitor?",
                isVisible: ({ record }: any) =>
                  record?.params?.status === "CHECKED_IN",
                isAccessible: true,
                handler: async (request: any, response: any, context: any) => {
                  const { record } = context;
                  if (record?.params?.status !== "CHECKED_IN") {
                    return {
                      record: record.toJSON(),
                      notice: {
                        type: "error",
                        message: `Cannot check out: visitor status is ${record?.params?.status || "unknown"}`,
                      },
                    };
                  }
                  await record.update({
                    status: "CHECKED_OUT",
                    checkOutAt: new Date(),
                  });
                  return {
                    record: record.toJSON(),
                    notice: { type: "success", message: "Visitor checked out" },
                  };
                },
              },
              sendQr: {
                actionType: "record" as const,
                label: "Send QR",
                icon: "Send",
                component: Components.SendQrModal,
                isVisible: true,
                isAccessible: ({ record }: any) => !!record?.params?.id,
                handler: async (request: any, response: any, context: any) => {
                  return { record: context.record.toJSON() };
                },
              },
              list: {
                before: async (request: any, context: any) => {
                  const { currentAdmin } = context;
                  if (!request.query?.["filters.status"]) {
                    request.query = {
                      ...request.query,
                      "filters.status": "CHECKED_IN",
                    };
                  }
                  if (currentAdmin?.role === "HOST" && currentAdmin?.hostId) {
                    request.query["filters.hostId"] = currentAdmin.hostId;
                  }
                  return request;
                },
              },
            },
          },
        },
        // Pre Register Resource (Visit with pre-registration statuses)
        {
          resource: { model: getModel("Visit"), client: prisma },
          options: {
            id: "PreRegister",
            navigation: { name: "Operations", icon: "Calendar" },
            listProperties: [
              "visitorName",
              "visitorPhone",
              "hostId",
              "expectedDate",
              "status",
              "createdAt",
            ],
            filterProperties: ["status", "location", "expectedDate"],
            editProperties: [
              "visitorName",
              "visitorCompany",
              "visitorPhone",
              "visitorEmail",
              "hostId",
              "purpose",
              "expectedDate",
              "location",
            ],
            properties: {
              id: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              sessionId: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              hostId: {
                type: "reference" as const,
                reference: "Hosts",
                isVisible: { list: true, edit: true, filter: true, show: true },
              },
              status: {
                isVisible: {
                  list: true,
                  edit: false,
                  show: true,
                  filter: true,
                },
              },
              approvedAt: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              rejectedAt: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              rejectionReason: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              checkInAt: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              checkOutAt: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              createdAt: {
                isVisible: {
                  list: true,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
              updatedAt: {
                isVisible: {
                  list: false,
                  edit: false,
                  show: true,
                  filter: false,
                },
              },
            },
            actions: {
              new: {
                isAccessible: ({ currentAdmin }: any) => {
                  const role = currentAdmin?.role;
                  return (
                    role === "ADMIN" || role === "HOST" || role === "RECEPTION"
                  );
                },
              },
              edit: {
                isAccessible: () => false,
              },
              approve: {
                actionType: "record" as const,
                label: "Approve",
                icon: "Check",
                variant: "success" as const,
                guard: "Approve this pre-registration?",
                isVisible: true,
                isAccessible: ({ currentAdmin, record }: any) => {
                  const status = record?.params?.status;
                  if (status !== "PENDING_APPROVAL") return false;
                  const role = currentAdmin?.role;
                  if (role === "RECEPTION") return false;
                  if (role === "ADMIN") return true;
                  if (role === "HOST") {
                    return (
                      record?.params?.hostId?.toString() ===
                      currentAdmin?.hostId?.toString()
                    );
                  }
                  return false;
                },
                handler: async (request: any, response: any, context: any) => {
                  const { record } = context;
                  await record.update({
                    status: "APPROVED",
                    approvedAt: new Date(),
                  });
                  return {
                    record: record.toJSON(),
                    notice: {
                      type: "success",
                      message: "Pre-registration approved",
                    },
                  };
                },
              },
              reject: {
                actionType: "record" as const,
                label: "Reject",
                icon: "X",
                variant: "danger" as const,
                guard: "Reject this pre-registration?",
                isVisible: true,
                isAccessible: ({ currentAdmin, record }: any) => {
                  const status = record?.params?.status;
                  if (status !== "PENDING_APPROVAL") return false;
                  const role = currentAdmin?.role;
                  if (role === "RECEPTION") return false;
                  if (role === "ADMIN") return true;
                  if (role === "HOST") {
                    return (
                      record?.params?.hostId?.toString() ===
                      currentAdmin?.hostId?.toString()
                    );
                  }
                  return false;
                },
                handler: async (request: any, response: any, context: any) => {
                  const { record } = context;
                  await record.update({
                    status: "REJECTED",
                    rejectedAt: new Date(),
                  });
                  return {
                    record: record.toJSON(),
                    notice: {
                      type: "success",
                      message: "Pre-registration rejected",
                    },
                  };
                },
              },
              list: {
                before: async (request: any, context: any) => {
                  const { currentAdmin } = context;
                  if (!request.query?.["filters.status"]) {
                    request.query = {
                      ...request.query,
                      "filters.status": "PENDING_APPROVAL",
                    };
                  }
                  if (currentAdmin?.role === "HOST" && currentAdmin?.hostId) {
                    request.query["filters.hostId"] = currentAdmin.hostId;
                  }
                  return request;
                },
              },
            },
          },
        },
        // Users Resource (Admin only - hidden from HOST and RECEPTION)
        {
          resource: { model: getModel("User"), client: prisma },
          options: {
            id: "Users",
            navigation: { name: "System", icon: "Users" },
            listProperties: ["name", "email", "role", "createdAt"],
            filterProperties: ["role"],
            properties: {
              password: {
                type: "password",
                isVisible: {
                  list: false,
                  show: false,
                  edit: true,
                  filter: false,
                },
              },
              role: {
                availableValues: [
                  { value: "ADMIN", label: "Admin" },
                  { value: "RECEPTION", label: "Reception" },
                  { value: "HOST", label: "Host" },
                ],
                isVisible: { list: true, show: true, edit: true, filter: true },
              },
              hostId: {
                isVisible: {
                  list: false,
                  show: false,
                  edit: false,
                  filter: false,
                },
              },
              host: {
                isVisible: {
                  list: false,
                  show: false,
                  edit: false,
                  filter: false,
                },
              },
              createdAt: {
                isVisible: {
                  list: true,
                  show: false,
                  edit: false,
                  filter: false,
                },
              },
              updatedAt: {
                isVisible: {
                  list: false,
                  show: false,
                  edit: false,
                  filter: false,
                },
              },
            },
            actions: {
              list: {
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
                isVisible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
              },
              new: {
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
                before: async (request: any) => {
                  if (request.payload?.password) {
                    request.payload.password = await bcrypt.hash(
                      request.payload.password,
                      12,
                    );
                  }
                  return request;
                },
              },
              edit: {
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
                before: async (request: any) => {
                  if (request.payload?.password) {
                    request.payload.password = await bcrypt.hash(
                      request.payload.password,
                      12,
                    );
                  } else {
                    delete request.payload?.password;
                  }
                  return request;
                },
              },
              delete: {
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
              },
              show: {
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
              },
            },
          },
        },
        // Audit Log Resource (Admin only - hidden from HOST and RECEPTION)
        {
          resource: { model: getModel("AuditLog"), client: prisma },
          options: {
            id: "AuditLog",
            navigation: { name: "System", icon: "FileText" },
            actions: {
              list: {
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
                isVisible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
              },
              show: {
                isAccessible: ({ currentAdmin }: any) =>
                  currentAdmin?.role === "ADMIN",
              },
              new: { isAccessible: false },
              edit: { isAccessible: false },
              delete: { isAccessible: false },
            },
          },
        },
      ],
      locale: {
        language: "en",
        translations: {
          en: {
            labels: {
              Hosts: "Hosts",
              Deliveries: "Deliveries",
              Visitors: "Visitors",
              PreRegister: "Pre Register",
              Users: "Users",
              AuditLog: "Audit Log",
              location: {
                BARWA_TOWERS: "Barwa Towers",
                MARINA_50: "Marina 50",
                ELEMENT_MARIOTT: "Element Marriott",
              },
              role: {
                ADMIN: "Admin",
                RECEPTION: "Reception",
                HOST: "Host",
                Admin: "Admin",
                Reception: "Reception",
                Host: "Host",
                admin: "Admin",
                reception: "Reception",
                host: "Host",
              },
              Role: {
                ADMIN: "Admin",
                RECEPTION: "Reception",
                HOST: "Host",
                Admin: "Admin",
                Reception: "Reception",
                Host: "Host",
              },
            },
            properties: {
              hostId: "Host",
              visitorName: "Visitor Name",
              visitorCompany: "Company",
              visitorPhone: "Phone",
              visitorEmail: "Email",
              purpose: "Purpose",
              expectedDate: "Expected Visit Date",
              courier: "Courier",
              recipient: "Recipient",
              notes: "Notes",
              location: "Location",
              name: "Name",
              company: "Company",
              email: "Email",
              phone: "Phone",
              status: "Status",
              checkInAt: "Check In Time",
              checkOutAt: "Check Out Time",
              receivedAt: "Received At",
              pickedUpAt: "Picked Up At",
              createdAt: "Created At",
              updatedAt: "Updated At",
              role: "Role",
              Role: "Role",
            },
            actions: {
              markPickedUp: "Mark Picked Up",
              checkout: "Check Out",
              sendQr: "Send QR",
              approve: "Approve",
              reject: "Reject",
              bulkImport: "Bulk Import",
            },
            components: {
              Login: {
                welcomeMessage: "Welcome to Admin Panel",
              },
            },
            resources: {
              User: {
                properties: {
                  role: "Role",
                },
              },
              Hosts: {
                properties: {
                  role: "Role",
                },
              },
            },
          },
        },
      },
    });

    const rootPath = admin.options.rootPath;

    // Create a SHARED session store for both auto-login and AdminJS
    const session = require("express-session");
    const MemoryStore = session.MemoryStore;
    const sharedSessionStore = new MemoryStore();

    const sharedSessionConfig = {
      store: sharedSessionStore,
      secret: cookieSecret,
      name: "adminjs",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production", // Required for HTTPS in production
      },
    };

    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
      admin,
      {
        authenticate: async (email: string, password: string) => {
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { host: true },
          });
          if (!user) return null;
          const match = await bcrypt.compare(password, user.password);
          if (!match) return null;

          // Return user with role and hostId for RBAC
          return {
            email: user.email,
            role: user.role,
            hostId: user.hostId?.toString(),
            hostCompany: user.host?.company,
            name: user.name,
          };
        },
        cookieName: "adminjs",
        cookiePassword: cookieSecret,
      },
      null,
      sharedSessionConfig, // Use shared session store
    );

    // Get Express app to register routes BEFORE adminRouter (which has auth middleware)
    const httpAdapter = app.getHttpAdapter();
    const expressApp = httpAdapter.getInstance();

    // Auto-login from kiosk: /admin/auto-login?token=JWT
    // Must be registered BEFORE adminRouter so it bypasses AdminJS auth middleware.
    // Uses the SAME session store as AdminJS so sessions are shared.
    const autoLoginSessionMiddleware = session(sharedSessionConfig);

    expressApp.get(
      `${rootPath}/auto-login`,
      autoLoginSessionMiddleware,
      async (req: any, res: any) => {
        const token = req.query.token as string;
        if (!token) {
          return res.redirect(`${rootPath}/login`);
        }

        try {
          // Verify JWT using same secret as API
          const jwt = require("jsonwebtoken");
          const secret =
            process.env.JWT_SECRET || "fallback-secret-min-32-chars";
          const payload = jwt.verify(token, secret) as {
            sub: number;
            email?: string;
            role?: string;
          };

          // Look up user by ID from token
          const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            include: { host: true },
          });

          if (!user) {
            return res.redirect(`${rootPath}/login`);
          }

          // Only allow ADMIN and RECEPTION (GM is also ADMIN)
          if (user.role !== "ADMIN" && user.role !== "RECEPTION") {
            return res.redirect(`${rootPath}/login`);
          }

          // Create AdminJS session (same shape as authenticate() result)
          req.session.adminUser = {
            email: user.email,
            role: user.role,
            hostId: user.hostId?.toString(),
            hostCompany: user.host?.company,
            name: user.name,
          };

          // Save session before redirect
          req.session.save((err: any) => {
            if (err) {
              console.error("Session save failed:", err);
              return res.redirect(`${rootPath}/login`);
            }
            return res.redirect(rootPath);
          });
        } catch (err) {
          console.error("Admin auto-login failed:", err);
          return res.redirect(`${rootPath}/login`);
        }
      },
    );

    // Debug quick-login: standalone page + inject into login HTML (when ADMINJS_QUICK_LOGIN=true)
    const showAdminQuickLogin =
      process.env.ADMINJS_QUICK_LOGIN === "true" ||
      (process.env.NODE_ENV !== "production" &&
        process.env.ADMINJS_QUICK_LOGIN !== "false");

    // Custom login page CSS
    const loginPageStyles = `
<style>
  /* Hide default AdminJS login styling and apply custom design */
  body {
    background: #f9fafb !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }

  /* Center the login box */
  [data-css="login"] {
    min-height: 100vh !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: #f9fafb !important;
  }

  /* Style the login card */
  [data-css="login"] > section,
  [data-css="login"] > div > section,
  [data-css="login"] form {
    background: white !important;
    border-radius: 8px !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
    overflow: hidden !important;
    max-width: 400px !important;
    width: 100% !important;
  }

  /* Add indigo accent bar at top */
  [data-css="login"] > section::before,
  [data-css="login"] > div > section::before {
    content: '' !important;
    display: block !important;
    height: 8px !important;
    background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%) !important;
    border-radius: 8px 8px 0 0 !important;
  }

  /* Style the title */
  [data-css="login"] h1,
  [data-css="login"] [class*="H1"],
  [data-css="login"] [class*="Title"] {
    font-size: 1.5rem !important;
    font-weight: 600 !important;
    color: #1f2937 !important;
    text-align: center !important;
    margin-bottom: 1rem !important;
  }

  /* Style labels */
  [data-css="login"] label {
    display: block !important;
    font-weight: 600 !important;
    color: #374151 !important;
    margin-bottom: 8px !important;
    font-size: 14px !important;
  }

  /* Style inputs */
  [data-css="login"] input[type="text"],
  [data-css="login"] input[type="email"],
  [data-css="login"] input[type="password"] {
    width: 100% !important;
    padding: 12px !important;
    border: 1px solid #d1d5db !important;
    border-radius: 4px !important;
    font-size: 14px !important;
    outline: none !important;
    box-sizing: border-box !important;
    transition: border-color 0.2s, box-shadow 0.2s !important;
  }

  [data-css="login"] input:focus {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
  }

  /* Style submit button */
  [data-css="login"] button[type="submit"],
  [data-css="login"] [class*="Button"][class*="primary"] {
    background: #6366f1 !important;
    color: white !important;
    border: none !important;
    padding: 10px 20px !important;
    border-radius: 6px !important;
    font-weight: 500 !important;
    cursor: pointer !important;
    transition: background-color 0.2s !important;
  }

  [data-css="login"] button[type="submit"]:hover,
  [data-css="login"] [class*="Button"][class*="primary"]:hover {
    background: #4f46e5 !important;
  }

  /* Style form sections with padding */
  [data-css="login"] form > div,
  [data-css="login"] form section {
    padding: 8px 32px !important;
  }

  /* Hide logo if present */
  [data-css="login"] img[alt*="logo"],
  [data-css="login"] [class*="Logo"] {
    display: none !important;
  }

  /* Style any links */
  [data-css="login"] a {
    color: #6b7280 !important;
    font-size: 14px !important;
    text-decoration: none !important;
  }

  [data-css="login"] a:hover {
    color: #ef4444 !important;
    text-decoration: underline !important;
  }
</style>`;

    const quickLoginFormsHtml = `
<div style="margin-top:1rem;padding:0.75rem;border:1px solid #ddd;border-radius:6px;background:#f5f5f5;">
  <p style="margin:0 0 0.5rem 0;font-size:0.85rem;color:#555;">Debug quick login:</p>
  <form method="POST" action="${rootPath}/login" enctype="multipart/form-data" style="display:inline-block;margin-right:0.5rem;margin-bottom:0.25rem;">
    <input type="hidden" name="email" value="admin@arafatvisitor.cloud"><input type="hidden" name="password" value="admin123">
    <button type="submit" style="padding:0.35rem 0.75rem;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#fff;">Admin</button>
  </form>
  <form method="POST" action="${rootPath}/login" enctype="multipart/form-data" style="display:inline-block;margin-right:0.5rem;margin-bottom:0.25rem;">
    <input type="hidden" name="email" value="gm@arafatvisitor.cloud"><input type="hidden" name="password" value="gm123">
    <button type="submit" style="padding:0.35rem 0.75rem;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#fff;">GM</button>
  </form>
  <form method="POST" action="${rootPath}/login" enctype="multipart/form-data" style="display:inline-block;margin-right:0.5rem;margin-bottom:0.25rem;">
    <input type="hidden" name="email" value="host@arafatvisitor.cloud"><input type="hidden" name="password" value="host123">
    <button type="submit" style="padding:0.35rem 0.75rem;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#fff;">Host</button>
  </form>
  <form method="POST" action="${rootPath}/login" enctype="multipart/form-data" style="display:inline-block;margin-right:0.5rem;margin-bottom:0.25rem;">
    <input type="hidden" name="email" value="reception@arafatvisitor.cloud"><input type="hidden" name="password" value="reception123">
    <button type="submit" style="padding:0.35rem 0.75rem;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#fff;">Reception</button>
  </form>
</div>`;

    // Custom logout route - destroy session and redirect to login
    const logoutSessionMiddleware = session(sharedSessionConfig);
    expressApp.get(
      `${rootPath}/logout`,
      logoutSessionMiddleware,
      (req: any, res: any) => {
        req.session.destroy((err: any) => {
          if (err) {
            console.error("Logout session destroy error:", err);
          }
          res.clearCookie("connect.sid");
          res.redirect(`${rootPath}/login`);
        });
      },
    );

    // Serve custom login page BEFORE AdminJS handles it
    expressApp.get(`${rootPath}/login`, (req: any, res: any) => {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Arafat VMS</title>
  <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'DM Sans', sans-serif; }
    .login-card {
      box-shadow: 0 10px 40px rgba(37, 99, 235, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(226, 232, 240, 0.8);
    }
    .accent-bar {
      background: #2563eb;
    }
    .input-field {
      transition: all 0.2s ease;
      border: 1.5px solid #e2e8f0;
    }
    .input-field:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .btn-primary {
      background: #2563eb;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
    }
    .btn-primary:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    }
    .forgot-link {
      position: relative;
      color: #2563eb;
      transition: all 0.2s ease;
    }
    .forgot-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      width: 0;
      height: 1.5px;
      background: #2563eb;
      transition: all 0.2s ease;
      transform: translateX(-50%);
    }
    .forgot-link:hover::after {
      width: 100%;
    }
    .forgot-link:hover {
      color: #1d4ed8;
    }
    .quick-btn {
      transition: all 0.15s ease;
      border: 1.5px solid #e2e8f0;
    }
    .quick-btn:hover {
      border-color: #93c5fd;
      background: #eff6ff;
      color: #2563eb;
    }
  </style>
</head>
<body class="bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
  <div class="h-screen flex flex-col text-gray-800 antialiased justify-center relative">
    <div class="relative py-4 w-full max-w-md mx-auto px-4">
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg mb-4">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900" id="pageTitle">Welcome Back</h1>
        <p class="text-gray-500 mt-1 text-sm" id="pageSubtitle">Sign in to your account</p>
      </div>

      <div class="login-card bg-white rounded-2xl overflow-hidden">
        <div class="accent-bar h-1.5"></div>

        <!-- Login Form -->
        <form id="loginForm" method="POST" action="${rootPath}/login" enctype="multipart/form-data" class="p-8">
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input type="email" name="email" placeholder="you@example.com" required
                class="input-field w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 outline-none" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input type="password" name="password" placeholder="Enter your password" required
                class="input-field w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 outline-none" />
            </div>
          </div>

          <div class="mt-7">
            <button type="submit" class="btn-primary w-full py-3.5 text-white font-semibold rounded-xl">
              Sign In
            </button>
          </div>

          <div class="mt-5 text-center">
            <a href="#" onclick="showForgotPassword(); return false;" class="forgot-link text-sm font-medium">
              Forgot your password?
            </a>
          </div>
        </form>

        <!-- Forgot Password Form (hidden by default) -->
        <form id="forgotForm" class="p-8 hidden">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 mb-3">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p class="text-gray-600 text-sm">Enter your email and we'll send you a reset link.</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input type="email" id="forgotEmail" placeholder="you@example.com" required
              class="input-field w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 outline-none" />
          </div>

          <div id="forgotMessage" class="mt-4 text-sm text-center hidden p-3 rounded-lg"></div>

          <div class="mt-6">
            <button type="submit" onclick="submitForgotPassword(event)" class="btn-primary w-full py-3.5 text-white font-semibold rounded-xl">
              Send Reset Link
            </button>
          </div>

          <div class="mt-5 text-center">
            <a href="#" onclick="showLogin(); return false;" class="forgot-link text-sm font-medium">
              Back to sign in
            </a>
          </div>
        </form>

        <!-- Quick Login Buttons -->
        <div id="quickLogin" class="px-8 pb-8 pt-4 border-t border-gray-100">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 text-center">Quick Access</p>
          <div class="flex flex-wrap justify-center gap-2">
            <form method="POST" action="${rootPath}/login" enctype="multipart/form-data" class="inline">
              <input type="hidden" name="email" value="admin@arafatvisitor.cloud">
              <input type="hidden" name="password" value="admin123">
              <button type="submit" class="quick-btn px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg">Admin</button>
            </form>
            <form method="POST" action="${rootPath}/login" enctype="multipart/form-data" class="inline">
              <input type="hidden" name="email" value="gm@arafatvisitor.cloud">
              <input type="hidden" name="password" value="gm123">
              <button type="submit" class="quick-btn px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg">GM</button>
            </form>
            <form method="POST" action="${rootPath}/login" enctype="multipart/form-data" class="inline">
              <input type="hidden" name="email" value="host@arafatvisitor.cloud">
              <input type="hidden" name="password" value="host123">
              <button type="submit" class="quick-btn px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg">Host</button>
            </form>
            <form method="POST" action="${rootPath}/login" enctype="multipart/form-data" class="inline">
              <input type="hidden" name="email" value="reception@arafatvisitor.cloud">
              <input type="hidden" name="password" value="reception123">
              <button type="submit" class="quick-btn px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg">Reception</button>
            </form>
          </div>
        </div>
      </div>

      <p class="text-center text-xs text-gray-400 mt-6">Arafat Visitor Management System</p>
    </div>
  </div>
  <script>
    function showForgotPassword() {
      document.getElementById('loginForm').classList.add('hidden');
      document.getElementById('forgotForm').classList.remove('hidden');
      document.getElementById('quickLogin').classList.add('hidden');
      document.getElementById('pageTitle').textContent = 'Reset Password';
      document.getElementById('pageSubtitle').textContent = 'We will help you recover your account';
    }
    function showLogin() {
      document.getElementById('loginForm').classList.remove('hidden');
      document.getElementById('forgotForm').classList.add('hidden');
      document.getElementById('quickLogin').classList.remove('hidden');
      document.getElementById('pageTitle').textContent = 'Welcome Back';
      document.getElementById('pageSubtitle').textContent = 'Sign in to your account';
      document.getElementById('forgotMessage').classList.add('hidden');
    }
    async function submitForgotPassword(e) {
      e.preventDefault();
      var email = document.getElementById('forgotEmail').value;
      var msgEl = document.getElementById('forgotMessage');
      msgEl.classList.remove('hidden');
      msgEl.className = 'mt-4 text-sm text-center p-3 rounded-lg bg-gray-50 text-gray-600';
      msgEl.textContent = 'Sending...';
      try {
        var res = await fetch('/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
        var data = await res.json();
        msgEl.className = 'mt-4 text-sm text-center p-3 rounded-lg bg-green-50 text-green-700';
        msgEl.textContent = data.message || 'If an account exists, a reset link has been sent.';
      } catch (err) {
        msgEl.className = 'mt-4 text-sm text-center p-3 rounded-lg bg-red-50 text-red-700';
        msgEl.textContent = 'Failed to send reset link. Please try again.';
      }
    }
  </script>
</body>
</html>`);
    });

    // Reset Password Page
    expressApp.get(`${rootPath}/reset-password`, (req: any, res: any) => {
      const token = req.query.token || "";
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - Arafat VMS</title>
  <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>
  <div class="min-h-screen bg-gray-50 py-6 flex flex-col text-gray-800 antialiased justify-center relative overflow-hidden sm:py-12">
    <div class="relative py-3 w-96 sm:w-100 mx-auto text-center">
      <span class="text-2xl font-semibold">Reset Your Password</span>

      <div class="mt-4 bg-white shadow-md rounded-lg space-y-2 text-left">
        <div class="h-2 bg-indigo-400 rounded-t-md"></div>
        <form id="resetForm" class="px-8 py-6">
          <input type="hidden" id="resetToken" value="${token}" />

          <label class="block font-semibold">New Password</label>
          <input type="password" id="newPassword" placeholder="New Password" required minlength="6"
            class="border w-full h-5 px-3 py-5 mt-2 hover:outline-none focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded" />

          <label class="block font-semibold mt-4">Confirm Password</label>
          <input type="password" id="confirmPassword" placeholder="Confirm Password" required minlength="6"
            class="border w-full h-5 px-3 py-5 mt-2 hover:outline-none focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded" />

          <div id="resetMessage" class="mt-3 text-sm hidden"></div>

          <div class="flex items-center justify-between mt-4">
            <button type="submit" onclick="submitReset(event)" class="px-5 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">Reset Password</button>
            <a href="${rootPath}/login" class="text-sm text-indigo-600 hover:underline">Back to login</a>
          </div>
        </form>
      </div>
    </div>
  </div>
  <script>
    async function submitReset(e) {
      e.preventDefault();
      var token = document.getElementById('resetToken').value;
      var newPassword = document.getElementById('newPassword').value;
      var confirmPassword = document.getElementById('confirmPassword').value;
      var msgEl = document.getElementById('resetMessage');

      msgEl.classList.remove('hidden', 'text-green-600', 'text-red-600');

      if (!token) {
        msgEl.classList.add('text-red-600');
        msgEl.textContent = 'Invalid or missing reset token.';
        return;
      }
      if (newPassword !== confirmPassword) {
        msgEl.classList.add('text-red-600');
        msgEl.textContent = 'Passwords do not match.';
        return;
      }
      if (newPassword.length < 6) {
        msgEl.classList.add('text-red-600');
        msgEl.textContent = 'Password must be at least 6 characters.';
        return;
      }

      msgEl.textContent = 'Resetting...';
      try {
        var res = await fetch('/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token, newPassword: newPassword })
        });
        var data = await res.json();
        if (res.ok) {
          msgEl.classList.add('text-green-600');
          msgEl.textContent = 'Password reset successfully! Redirecting to login...';
          setTimeout(function() { window.location.href = '${rootPath}/login'; }, 2000);
        } else {
          msgEl.classList.add('text-red-600');
          msgEl.textContent = data.message || 'Failed to reset password.';
        }
      } catch (err) {
        msgEl.classList.add('text-red-600');
        msgEl.textContent = 'Failed to reset password. Please try again.';
      }
    }
  </script>
</body>
</html>`);
    });

    if (showAdminQuickLogin) {
      const port = process.env.PORT || 3000;
      console.log(
        `Admin quick-login: http://localhost:${port}${rootPath}/quick-login`,
      );

      // Standalone quick-login page
      expressApp.get(`${rootPath}/quick-login`, (_req: any, res: any) => {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(`
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Quick Login - Arafat VMS</title></head>
<body style="font-family:sans-serif;max-width:480px;margin:2rem auto;padding:1rem;">
  <h1 style="margin-bottom:0.5rem;">Arafat VMS</h1>
  <p style="color:#666;margin-bottom:1rem;">Debug quick login</p>
  ${quickLoginFormsHtml}
  <p style="margin-top:1rem;font-size:0.9rem;"><a href="${rootPath}/login">Standard login</a></p>
</body></html>`);
      });
    }

    // Settings API routes - must be before adminRouter to bypass AdminJS auth middleware
    // These use the same session as AdminJS
    const settingsSessionMiddleware = session(sharedSessionConfig);
    const requireAdminSession = (req: any, res: any, next: any) => {
      if (!req.session?.adminUser || req.session.adminUser.role !== "ADMIN") {
        return res.status(401).json({ message: "Unauthorized" });
      }
      next();
    };

    // Parse JSON body for settings routes
    const jsonParser = require("express").json();

    // GET /admin/api/settings
    expressApp.get(
      `${rootPath}/api/settings`,
      settingsSessionMiddleware,
      requireAdminSession,
      (_req: any, res: any) => {
        res.json({
          site: {
            name: process.env.SITE_NAME || "Arafat VMS",
            timezone: process.env.SITE_TIMEZONE || "Asia/Qatar",
          },
          whatsapp: {
            enabled: !!(
              process.env.WHATSAPP_ENDPOINT && process.env.WHATSAPP_API_KEY
            ),
            provider: "wbiztool",
            configured: !!(
              process.env.WHATSAPP_ENDPOINT &&
              process.env.WHATSAPP_CLIENT_ID &&
              process.env.WHATSAPP_CLIENT &&
              process.env.WHATSAPP_API_KEY
            ),
          },
          smtp: {
            enabled: process.env.SMTP_ENABLED === "true",
            host: process.env.SMTP_HOST || "Not configured",
            configured: !!process.env.SMTP_HOST && !!process.env.SMTP_USER,
          },
          maintenance: {
            enabled: process.env.MAINTENANCE_MODE === "true",
            message:
              process.env.MAINTENANCE_MESSAGE || "System under maintenance",
          },
        });
      },
    );

    // POST /admin/api/settings/test-whatsapp
    expressApp.post(
      `${rootPath}/api/settings/test-whatsapp`,
      settingsSessionMiddleware,
      jsonParser,
      requireAdminSession,
      async (req: any, res: any) => {
        const { phone } = req.body;
        if (!phone) {
          return res.status(400).json({ message: "Phone number required" });
        }
        if (!process.env.WHATSAPP_ENDPOINT || !process.env.WHATSAPP_API_KEY) {
          return res.status(400).json({ message: "WhatsApp not configured" });
        }
        try {
          const { WhatsAppService } =
            await import("./notifications/whatsapp.service");
          const whatsappService = app.get(WhatsAppService);
          const sent = await whatsappService.send(
            phone,
            "This is a test message from Arafat VMS. If you received this, WhatsApp is configured correctly!",
          );
          if (!sent) {
            return res
              .status(500)
              .json({ message: "Failed to send test message" });
          }
          res.json({ success: true, message: "Test message sent" });
        } catch (e) {
          console.error("WhatsApp test failed:", e);
          res.status(500).json({ message: "Failed to send test message" });
        }
      },
    );

    // POST /admin/api/settings/test-email
    expressApp.post(
      `${rootPath}/api/settings/test-email`,
      settingsSessionMiddleware,
      jsonParser,
      requireAdminSession,
      async (req: any, res: any) => {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ message: "Email address required" });
        }
        if (!process.env.SMTP_HOST) {
          return res.status(400).json({ message: "SMTP not configured" });
        }
        try {
          const { EmailService } =
            await import("./notifications/email.service");
          const emailService = app.get(EmailService);
          await emailService.send({
            to: email,
            subject: "Test Email - Arafat VMS",
            html: "<h2>Test Email</h2><p>This is a test email from Arafat VMS. If you received this, SMTP is configured correctly!</p>",
          });
          res.json({ success: true, message: "Test email sent" });
        } catch (e) {
          console.error("Email test failed:", e);
          res.status(500).json({ message: "Failed to send test email" });
        }
      },
    );

    // GET /admin/api/qr/:visitId - Get QR code for a visit
    expressApp.get(
      `${rootPath}/api/qr/:visitId`,
      settingsSessionMiddleware,
      async (req: any, res: any) => {
        const { visitId } = req.params;
        try {
          const visit = await prisma.visit.findUnique({
            where: { id: visitId },
            include: { qrToken: true },
          });
          if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
          }
          const token = visit.qrToken?.token || visit.sessionId;
          const QRCode = require("qrcode");
          const qrDataUrl = await QRCode.toDataURL(token, {
            width: 300,
            margin: 2,
          });
          res.json({ qrDataUrl, token });
        } catch (e) {
          console.error("QR generation error:", e);
          res.status(500).json({ message: "Failed to generate QR code" });
        }
      },
    );

    // POST /admin/api/send-qr - Send QR code via WhatsApp or Email
    expressApp.post(
      `${rootPath}/api/send-qr`,
      settingsSessionMiddleware,
      jsonParser,
      async (req: any, res: any) => {
        const { visitId, method } = req.body;
        console.log(
          "[send-qr] Starting for visitId:",
          visitId,
          "method:",
          method,
        );

        try {
          const visit = await prisma.visit.findUnique({
            where: { id: visitId },
            include: { qrToken: true, host: true },
          });

          if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
          }

          console.log("[send-qr] Visit found:", visit.visitorName);

          const token = visit.qrToken?.token || visit.sessionId;
          const QRCode = require("qrcode");
          const qrDataUrl = await QRCode.toDataURL(token, {
            width: 300,
            margin: 2,
          });
          console.log("[send-qr] QR generated, length:", qrDataUrl.length);

          if (method === "whatsapp") {
            if (!visit.visitorPhone) {
              return res
                .status(400)
                .json({ message: "No phone number available" });
            }

            console.log("[send-qr] Generating visitor card image...");

            // Generate visitor card image with QR code
            const { createCanvas, loadImage } = require("canvas");
            const cardWidth = 400;
            const cardHeight = 600;
            const canvas = createCanvas(cardWidth, cardHeight);
            const ctx = canvas.getContext("2d");

            // Background - white with subtle gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, cardHeight);
            gradient.addColorStop(0, "#ffffff");
            gradient.addColorStop(1, "#f8fafc");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, cardWidth, cardHeight);

            // Header bar - blue accent
            ctx.fillStyle = "#2563eb";
            ctx.fillRect(0, 0, cardWidth, 80);

            // Header text
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 24px Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("VISITOR PASS", cardWidth / 2, 50);

            // Visitor name
            ctx.fillStyle = "#1e293b";
            ctx.font = "bold 28px Arial, sans-serif";
            ctx.fillText(visit.visitorName || "Visitor", cardWidth / 2, 130);

            // Visitor Company
            ctx.fillStyle = "#64748b";
            ctx.font = "18px Arial, sans-serif";
            ctx.fillText(visit.visitorCompany || "", cardWidth / 2, 160);

            // QR Code - load from data URL (in the middle)
            const qrImage = await loadImage(qrDataUrl);
            const qrSize = 200;
            const qrX = (cardWidth - qrSize) / 2;
            const qrY = 190;

            // QR background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 2;
            ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

            // Draw QR code
            ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

            // Scan instruction
            ctx.fillStyle = "#94a3b8";
            ctx.font = "12px Arial, sans-serif";
            ctx.fillText(
              "Scan at reception for check-in",
              cardWidth / 2,
              qrY + qrSize + 30,
            );

            // Divider line
            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(40, 450);
            ctx.lineTo(cardWidth - 40, 450);
            ctx.stroke();

            // Host section (bottom)
            ctx.fillStyle = "#475569";
            ctx.font = "14px Arial, sans-serif";
            ctx.fillText("VISITING", cardWidth / 2, 475);

            ctx.fillStyle = "#1e293b";
            ctx.font = "bold 18px Arial, sans-serif";
            ctx.fillText(visit.host?.name || "Host", cardWidth / 2, 500);

            ctx.fillStyle = "#64748b";
            ctx.font = "14px Arial, sans-serif";
            ctx.fillText(visit.host?.company || "", cardWidth / 2, 520);

            // Purpose
            ctx.fillStyle = "#1e293b";
            ctx.font = "14px Arial, sans-serif";
            const purpose = visit.purpose || "Visit";
            const maxPurposeWidth = cardWidth - 80;
            if (ctx.measureText(purpose).width > maxPurposeWidth) {
              ctx.fillText(
                purpose.substring(0, 35) + "...",
                cardWidth / 2,
                545,
              );
            } else {
              ctx.fillText(purpose, cardWidth / 2, 545);
            }

            // Date (at the bottom)
            const visitDate =
              visit.expectedDate || visit.createdAt || new Date();
            const dateStr = new Date(visitDate).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            ctx.fillStyle = "#475569";
            ctx.font = "bold 14px Arial, sans-serif";
            ctx.fillText(dateStr, cardWidth / 2, 575);

            // Convert canvas to base64
            const cardBase64 = canvas.toBuffer("image/png").toString("base64");

            console.log(
              "[send-qr] Sending WhatsApp image to:",
              visit.visitorPhone,
            );
            const { WhatsAppService } =
              await import("./notifications/whatsapp.service");
            const whatsappService = app.get(WhatsAppService);

            const caption = `Hello ${visit.visitorName}!\n\nYour visitor pass for ${visit.host?.company || "our office"} is ready.\n\nPlease show this QR code at reception for check-in.`;
            const sent = await whatsappService.sendImage(
              visit.visitorPhone,
              cardBase64,
              caption,
            );
            console.log("[send-qr] WhatsApp image result:", sent);

            if (!sent) {
              return res.status(503).json({
                message:
                  "WhatsApp service failed to send image. Check configuration.",
              });
            }
            return res.json({
              success: true,
              message: "QR card sent via WhatsApp",
            });
          }

          if (method === "email") {
            if (!visit.visitorEmail) {
              return res
                .status(400)
                .json({ message: "No email address available" });
            }

            console.log("[send-qr] Sending email to:", visit.visitorEmail);
            const { EmailService } =
              await import("./notifications/email.service");
            const emailService = app.get(EmailService);
            const sent = await emailService.send({
              to: visit.visitorEmail,
              subject: `Your Visit QR Code - ${visit.host?.company || "Office Visit"}`,
              html: `
              <h2>Hello ${visit.visitorName}!</h2>
              <p>Your QR code for visiting <strong>${visit.host?.company || "our office"}</strong> is ready.</p>
              <p>Please show this QR code at reception for check-in:</p>
              <img src="${qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
              <p>Host: ${visit.host?.name || "N/A"}</p>
              <p>Purpose: ${visit.purpose}</p>
              <br />
              <p>Thank you!</p>
            `,
            });
            console.log("[send-qr] Email result:", sent);

            if (!sent) {
              return res.status(503).json({
                message:
                  "Email service failed to send. Check SMTP configuration.",
              });
            }
            return res.json({ success: true, message: "QR sent via Email" });
          }

          return res.status(400).json({ message: "Invalid send method" });
        } catch (e) {
          console.error("[send-qr] Error:", e);
          return res.status(500).json({
            message:
              "Failed to send QR: " +
              (e instanceof Error ? e.message : "Unknown error"),
          });
        }
      },
    );

    // POST /admin/api/settings/update
    expressApp.post(
      `${rootPath}/api/settings/update`,
      settingsSessionMiddleware,
      jsonParser,
      requireAdminSession,
      async (req: any, res: any) => {
        const fs = require("fs");
        const pathModule = require("path");
        const envPath = pathModule.join(process.cwd(), ".env");

        try {
          let envContent = fs.readFileSync(envPath, "utf8");
          const updateEnvVar = (
            key: string,
            value: string | number | boolean,
          ) => {
            const strValue = String(value);
            const regex = new RegExp(`^${key}=.*$`, "m");
            if (regex.test(envContent)) {
              envContent = envContent.replace(regex, `${key}=${strValue}`);
            } else {
              envContent += `\n${key}=${strValue}`;
            }
            process.env[key] = strValue;
          };

          const { smtp, whatsapp, maintenance } = req.body;
          if (smtp) {
            if (smtp.enabled !== undefined)
              updateEnvVar("SMTP_ENABLED", smtp.enabled);
            if (smtp.host) updateEnvVar("SMTP_HOST", smtp.host);
            if (smtp.port) updateEnvVar("SMTP_PORT", smtp.port);
            if (smtp.user) updateEnvVar("SMTP_USER", smtp.user);
            if (smtp.pass) updateEnvVar("SMTP_PASS", smtp.pass);
            if (smtp.from) updateEnvVar("SMTP_FROM", smtp.from);
          }
          if (whatsapp) {
            if (whatsapp.endpoint)
              updateEnvVar("WHATSAPP_ENDPOINT", whatsapp.endpoint);
            if (whatsapp.clientId)
              updateEnvVar("WHATSAPP_CLIENT_ID", whatsapp.clientId);
            if (whatsapp.client)
              updateEnvVar("WHATSAPP_CLIENT", whatsapp.client);
            if (whatsapp.apiKey)
              updateEnvVar("WHATSAPP_API_KEY", whatsapp.apiKey);
          }
          if (maintenance) {
            if (maintenance.enabled !== undefined)
              updateEnvVar("MAINTENANCE_MODE", maintenance.enabled);
            if (maintenance.message)
              updateEnvVar("MAINTENANCE_MESSAGE", maintenance.message);
          }

          fs.writeFileSync(envPath, envContent);
          res.json({ success: true, message: "Settings updated" });
        } catch (e) {
          console.error("Settings update failed:", e);
          res.status(500).json({ message: "Failed to update settings" });
        }
      },
    );

    // POST /admin/api/hosts/import - Bulk import hosts from CSV or XLSX
    // Must be registered before adminRouter to avoid being caught by AdminJS
    // Supports ?validate=true for dry-run validation without database changes
    // Accepts: { csvContent: string } for CSV or { xlsxContent: base64string } for XLSX
    const jsonParserLarge = require("express").json({ limit: "50mb" });
    expressApp.post(
      `${rootPath}/api/hosts/import`,
      settingsSessionMiddleware,
      jsonParserLarge,
      requireAdminSession,
      async (req: any, res: any) => {
        const validateOnly = req.query.validate === "true";
        console.log(
          `Bulk import request received (validateOnly: ${validateOnly})`,
        );

        try {
          const { csvContent, xlsxContent } = req.body || {};

          let records: any[] = [];

          if (xlsxContent && typeof xlsxContent === "string") {
            // Parse XLSX from base64
            console.log(
              `XLSX content received, length: ${xlsxContent.length} chars`,
            );
            const XLSX = require("xlsx");
            const buffer = Buffer.from(xlsxContent, "base64");
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            records = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            console.log(
              `XLSX parsed successfully, ${records.length} records found`,
            );
          } else if (
            csvContent &&
            typeof csvContent === "string" &&
            csvContent.trim()
          ) {
            // Parse CSV
            console.log(
              `CSV content received, length: ${csvContent.length} chars`,
            );
            const { parse } = await import("csv-parse/sync");
            records = parse(csvContent, {
              columns: true,
              skip_empty_lines: true,
              trim: true,
              relax_column_count: true,
            });
            console.log(
              `CSV parsed successfully, ${records.length} records found`,
            );
          } else {
            return res
              .status(400)
              .json({ message: "csvContent or xlsxContent is required" });
          }

          console.log(
            `File parsed successfully, ${records.length} records found`,
          );
          if (records.length > 0) {
            console.log("CSV columns detected:", Object.keys(records[0]));
            console.log("First row data:", JSON.stringify(records[0]));
          }

          let totalProcessed = 0;
          let inserted = 0;
          let skipped = 0;
          let usersCreated = 0;
          let usersSkipped = 0;
          const rejectedRows: Array<{
            rowNumber: number;
            reason: string;
            data: {
              id: string;
              name: string;
              company: string;
              email: string;
              phone: string;
              location: string;
              status: string;
            };
          }> = [];
          const createdCredentials: Array<{
            name: string;
            email: string;
            password: string;
            company: string;
          }> = [];

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

          const mapLocation = (value?: string | null) => {
            if (!value) return null;
            const v = value.trim().toLowerCase();
            if (v.includes("barwa")) return "BARWA_TOWERS";
            if (v.includes("element") || v.includes("mariott"))
              return "ELEMENT_MARIOTT";
            if (v.includes("marina") && v.includes("50")) return "MARINA_50";
            return null;
          };

          const mapStatus = (value?: string | null): number | undefined => {
            if (!value) return undefined; // No default - require explicit status
            const v = value.trim().toLowerCase();
            if (v === "active" || v === "1") return 1;
            if (v === "inactive" || v === "0") return 0;
            return undefined; // Unknown value - reject for review
          };

          const cleanPhone = (value?: string | null) => {
            if (!value) return "";
            let v = value.replace(/[\s\-()]/g, "");
            if (v.startsWith("+")) {
              v = v.slice(1);
            }
            return v;
          };

          for (let index = 0; index < records.length; index++) {
            const row = records[index];
            const rowNumber = index + 2; // header is row 1
            totalProcessed += 1;

            const reasons: string[] = [];

            const externalIdRaw = (row["ID"] ?? "").toString().trim();
            const nameRaw = (row["Name"] ?? "").toString().trim();
            const companyRaw = (row["Company"] ?? "").toString().trim();
            const emailRaw = (row["Email Address"] ?? "").toString().trim();
            const phoneRaw = (row["Phone Number"] ?? "").toString().trim();
            const locationRaw = (row["Location"] ?? "").toString().trim();
            const statusRaw = (row["Status"] ?? "").toString().trim();

            const name = nameRaw || "";
            if (!name) {
              reasons.push("Missing name");
            }

            const company = companyRaw || null;

            const email = emailRaw ? emailRaw.toLowerCase() : null;
            if (email && !emailRegex.test(email)) {
              reasons.push("Invalid email format");
            }

            // Phone is required - validate presence and format
            const phone = cleanPhone(phoneRaw);
            if (!phone) {
              reasons.push("Missing phone");
            } else if (/[a-zA-Z]/.test(phone)) {
              reasons.push("Invalid phone (contains letters)");
            }
            // Convert empty string to null for database
            const phoneValue = phone || null;

            const location = mapLocation(locationRaw || null);

            const status = mapStatus(statusRaw || null);
            if (status === undefined) {
              reasons.push("Invalid or missing status");
            }

            if (reasons.length > 0) {
              rejectedRows.push({
                rowNumber,
                reason: reasons.join("; "),
                data: {
                  id: externalIdRaw,
                  name: nameRaw,
                  company: companyRaw,
                  email: emailRaw,
                  phone: phoneRaw,
                  location: locationRaw,
                  status: statusRaw,
                },
              });
              continue;
            }

            const externalId = externalIdRaw || null;

            // Check if host already exists by externalId
            let hostId: bigint | null = null;
            let hostIsNew = false;

            if (externalId) {
              const existingHost = await prisma.host.findUnique({
                where: { externalId },
              });
              if (existingHost) {
                // Host exists - skip host creation but may need to create user
                skipped += 1;
                hostId = existingHost.id;
              }
            }

            // If validate only, count and continue (no DB changes)
            if (validateOnly) {
              if (!hostId) {
                inserted += 1; // New host would be created
              }
              // Check if user would be created (for new or existing host)
              const userEmail = email || `host_${hostId || "new"}@system.local`;
              if (hostId) {
                // For existing host, check if user exists
                const existingUserByHostId = await prisma.user.findFirst({
                  where: { hostId: hostId },
                });
                if (!existingUserByHostId) {
                  const existingUserByEmail = await prisma.user.findUnique({
                    where: { email: userEmail },
                  });
                  if (!existingUserByEmail) {
                    usersCreated += 1; // User would be created for existing host
                  }
                }
              } else {
                // For new host, user will be created (unless email conflict)
                const existingUserByEmail = await prisma.user.findUnique({
                  where: { email: userEmail },
                });
                if (!existingUserByEmail) {
                  usersCreated += 1; // User would be created for new host
                }
              }
              continue;
            }

            // Create host if it doesn't exist
            if (!hostId) {
              try {
                const createdHost = await prisma.host.create({
                  data: {
                    externalId,
                    name,
                    company: company ?? "",
                    email,
                    phone: phoneValue,
                    location: location as any,
                    status: status ?? 1,
                  },
                });
                hostId = createdHost.id;
                hostIsNew = true;
                inserted += 1;
              } catch (e) {
                const errorMsg =
                  e instanceof Error ? e.message : "Unknown database error";
                console.error(`Row ${rowNumber} database error:`, e);
                rejectedRows.push({
                  rowNumber,
                  reason: `Database error: ${errorMsg}`,
                  data: {
                    id: externalIdRaw,
                    name: nameRaw,
                    company: companyRaw,
                    email: emailRaw,
                    phone: phoneRaw,
                    location: locationRaw,
                    status: statusRaw,
                  },
                });
                continue;
              }
            }

            // Create User account for the Host (new or existing host without user)
            try {
              const userEmail = email || `host_${hostId}@system.local`;

              // Check if user already exists by email
              const existingUserByEmail = await prisma.user.findUnique({
                where: { email: userEmail },
              });
              if (existingUserByEmail) {
                usersSkipped += 1;
              } else {
                // Check if user already exists by hostId
                const existingUserByHostId = await prisma.user.findFirst({
                  where: { hostId: hostId },
                });
                if (existingUserByHostId) {
                  usersSkipped += 1;
                } else {
                  // Create new user for this host
                  const crypto = require("crypto");
                  const randomPassword = crypto.randomBytes(8).toString("hex"); // 16 char password
                  const hashedPassword = await bcrypt.hash(randomPassword, 12);

                  await prisma.user.create({
                    data: {
                      email: userEmail,
                      password: hashedPassword,
                      name: name,
                      role: "HOST",
                      hostId: hostId,
                    },
                  });
                  usersCreated += 1;

                  // Store credentials for export
                  createdCredentials.push({
                    name: name,
                    email: userEmail,
                    password: randomPassword,
                    company: company ?? "",
                  });
                }
              }
            } catch (e) {
              const errorMsg =
                e instanceof Error ? e.message : "Unknown database error";
              console.error(`Row ${rowNumber} user creation error:`, e);
              // Don't reject the row if host was created, just log user creation failure
              if (!hostIsNew) {
                rejectedRows.push({
                  rowNumber,
                  reason: `User creation error: ${errorMsg}`,
                  data: {
                    id: externalIdRaw,
                    name: nameRaw,
                    company: companyRaw,
                    email: emailRaw,
                    phone: phoneRaw,
                    location: locationRaw,
                    status: statusRaw,
                  },
                });
              }
            }
          }

          const rejected = rejectedRows.length;

          console.log(
            `Bulk import completed: ${totalProcessed} processed, ${inserted} inserted, ${skipped} skipped, ${rejected} rejected`,
          );

          res.json({
            totalProcessed,
            inserted,
            skipped,
            rejected,
            rejectedRows,
            createdCredentials,
            usersCreated,
            usersSkipped,
          });
        } catch (error) {
          console.error("Bulk import error:", error);
          res.status(500).json({
            message: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
      },
    );

    app.use(admin.options.rootPath, adminRouter);
    console.log(
      `Admin dashboard at http://localhost:${process.env.PORT || 3000}${admin.options.rootPath}`,
    );
  } catch (err) {
    console.error("AdminJS setup failed:", err);
    console.log("API will run without Admin dashboard.");
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`VMS Backend running at http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
