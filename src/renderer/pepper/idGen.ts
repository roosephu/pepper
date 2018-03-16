import { randomBytes } from "crypto";

export function uniqueId(length?: number): string {
    length = length || 12;
    return randomBytes(length).toString("hex");
}
