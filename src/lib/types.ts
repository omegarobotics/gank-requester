export type Role = "top" | "mid" | "bot" | "support";

export type GankStatus = "pending" | "accepted" | "rejected";

export interface GankRequest {
  id: string;
  role: Role;
  status: GankStatus;
  reason?: string;
  createdAt: number;
}
