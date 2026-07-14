/**
 * @packageDocumentation
 * Static JSON helpers for Codex hook configuration rules.
 */
import type { JsonPrimitive } from "type-fest";

import { objectEntries, objectValues, setHas } from "ts-extras";

/** JSON array value. */
export type JsonArray = readonly JsonValue[];

/** JSON object value. */
export interface JsonObject {
    readonly [key: string]: JsonValue;
}

/** JSON value accepted by Codex hooks.json. */
export type JsonValue =
    | JsonArray
    | JsonObject
    | JsonPrimitive;

/** Current Codex lifecycle hook event names. */
const VALID_HOOK_EVENTS: ReadonlySet<string> = new Set([
    "PermissionRequest",
    "PostCompact",
    "PostToolUse",
    "PreCompact",
    "PreToolUse",
    "SessionStart",
    "Stop",
    "SubagentStart",
    "SubagentStop",
    "UserPromptSubmit",
]);

const isJsonPrimitive = (value: unknown): value is JsonPrimitive =>
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string";

const isJsonValue = (value: unknown): value is JsonValue => {
    if (isJsonPrimitive(value)) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.every((entry) => isJsonValue(entry));
    }

    return (
        typeof value === "object" &&
        objectValues(value).every((entry) => isJsonValue(entry))
    );
};

/** Determine whether a JSON value is an object. */
export const isJsonObject = (value: unknown): value is JsonObject =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/** Determine whether a JSON value is an array. */
export const isJsonArray = (value: unknown): value is JsonArray =>
    Array.isArray(value);

/** Parse strict JSON source text. */
export const parseJsonText = (text: string): JsonValue | undefined => {
    try {
        const value: unknown = JSON.parse(text);

        return isJsonValue(value) ? value : undefined;
    } catch {
        return undefined;
    }
};

/** Get stable event entries from an already-selected hooks object. */
export const getHookEventEntriesFromHooks = (
    hooks: unknown
): readonly (readonly [string, JsonValue])[] =>
    isJsonObject(hooks) ? objectEntries(hooks) : [];

/** Determine whether a string is a current Codex hook event. */
export const isValidHookEvent = (value: string): boolean =>
    setHas(VALID_HOOK_EVENTS, value);
