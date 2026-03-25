import type { UserRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: UserRole | null;
      onboarded: boolean;
      username?: string | null;
    };
  }

  interface User {
    role?: UserRole | null;
    onboarded?: boolean;
    username?: string | null;
    passwordHash?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole | null;
    onboarded?: boolean;
    username?: string | null;
  }
}
