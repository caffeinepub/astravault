import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface VaultNote {
    id: bigint;
    encryptedContent: string;
    createdAt: Time;
}
export interface CustomLink {
    id: bigint;
    url: string;
    name: string;
    iconName: string;
    category: string;
}
export interface UserProfile {
    customLinks: Array<CustomLink>;
    principal: Principal;
    username: string;
    vaultPasswordHash: string;
    name: string;
    createdAt: Time;
    email?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomLink(name: string, url: string, category: string, iconName: string): Promise<CustomLink>;
    addVaultNote(encryptedContent: string): Promise<VaultNote>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    changeVaultPassword(currentPasswordHash: string, newPasswordHash: string): Promise<void>;
    deleteAccount(): Promise<void>;
    deleteCustomLink(linkId: bigint): Promise<void>;
    deleteVaultNote(noteId: bigint): Promise<void>;
    editCustomLink(linkId: bigint, name: string, url: string, category: string, iconName: string): Promise<void>;
    editVaultNote(noteId: bigint, encryptedContent: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomLinks(): Promise<Array<CustomLink>>;
    getProfile(): Promise<UserProfile | null>;
    getVaultNotes(): Promise<Array<VaultNote>>;
    isCallerAdmin(): Promise<boolean>;
    isEmail2faEnabled(): Promise<boolean>;
    registerUser(name: string, username: string, email: string | null, vaultPasswordHash: string): Promise<void>;
    resetVaultPassword(newPasswordHash: string): Promise<void>;
    toggleEmail2fa(enable: boolean): Promise<void>;
    updateUserProfile(name: string, username: string, email: string | null, vaultPasswordHash: string | null): Promise<void>;
}
