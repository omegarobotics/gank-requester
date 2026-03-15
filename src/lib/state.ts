import { GankRequest } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var gankRequests: GankRequest[] | undefined;
  // eslint-disable-next-line no-var
  var gankIdCounter: number | undefined;
}

export function getRequests(): GankRequest[] {
  if (!globalThis.gankRequests) {
    globalThis.gankRequests = [];
  }
  return globalThis.gankRequests;
}

export function getNextId(): string {
  if (!globalThis.gankIdCounter) {
    globalThis.gankIdCounter = 0;
  }
  globalThis.gankIdCounter++;
  return String(globalThis.gankIdCounter);
}

export function resetState(): void {
  globalThis.gankRequests = [];
  globalThis.gankIdCounter = 0;
}
