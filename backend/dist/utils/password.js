"use strict";
/**
 * Password Hashing Utility
 *
 * Provides functions for hashing and verifying passwords using bcrypt
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
/**
 * Hash a plain text password
 * @param password - Plain text password
 * @returns Hashed password
 */
async function hashPassword(password) {
    return bcrypt_1.default.hash(password, SALT_ROUNDS);
}
/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches, false otherwise
 */
async function verifyPassword(password, hash) {
    return bcrypt_1.default.compare(password, hash);
}
//# sourceMappingURL=password.js.map