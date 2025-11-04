import { MockResizeObserver } from "@etsoo/shared";
import { vi } from "vitest";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Stub the global ResizeObserver
vi.stubGlobal("ResizeObserver", MockResizeObserver);
