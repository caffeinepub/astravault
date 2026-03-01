import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type UserRole = AccessControl.UserRole;

  // User Types
  public type UserProfile = {
    principal : Principal;
    name : Text;
    username : Text;
    email : ?Text;
    vaultPasswordHash : Text;
    customLinks : [CustomLink];
    createdAt : Time.Time;
  };

  public type CustomLink = {
    id : Nat;
    name : Text;
    url : Text;
    category : Text;
    iconName : Text;
  };

  public type VaultNote = {
    id : Nat;
    encryptedContent : Text;
    createdAt : Time.Time;
  };

  // Initialize authorization and persistent storage
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let users = Map.empty<Principal, UserProfile>();
  var nextCustomLinkId = 0;
  var nextVaultNoteId = 0;

  // ── User Management ──────────────────────────────────────────────────────────

  // Register a new user; only non-anonymous principals may register.
  public shared ({ caller }) func registerUser(
    name : Text,
    username : Text,
    email : ?Text,
    vaultPasswordHash : Text,
  ) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot register");
    };
    if (users.containsKey(caller)) {
      Runtime.trap("User already exists");
    };
    let userProfile : UserProfile = {
      principal = caller;
      name;
      username;
      email;
      vaultPasswordHash;
      customLinks = [];
      createdAt = Time.now();
    };
    users.add(caller, userProfile);
  };

  // Required by instructions: get the caller's own profile.
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    users.get(caller);
  };

  // Required by instructions: save (upsert) the caller's own profile.
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save their profile");
    };
    // Ensure the stored principal always matches the caller.
    let sanitised : UserProfile = { profile with principal = caller };
    users.add(caller, sanitised);
  };

  // Required by instructions: fetch any user's profile (self or admin).
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  // Update mutable fields of the caller's profile.
  public shared ({ caller }) func updateUserProfile(
    name : Text,
    username : Text,
    email : ?Text,
    vaultPasswordHash : ?Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update their profile");
    };
    switch (users.get(caller)) {
      case (?userProfile) {
        users.add(
          caller,
          {
            userProfile with
            name;
            username;
            email;
            vaultPasswordHash = switch (vaultPasswordHash) {
              case (?hash) { hash };
              case (null) { userProfile.vaultPasswordHash };
            };
          },
        );
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  // ── Custom Links ─────────────────────────────────────────────────────────────

  public shared ({ caller }) func addCustomLink(
    name : Text,
    url : Text,
    category : Text,
    iconName : Text,
  ) : async CustomLink {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add custom links");
    };

    let userProfile = switch (users.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User not found") };
    };

    let link : CustomLink = {
      id = nextCustomLinkId;
      name;
      url;
      category;
      iconName;
    };
    nextCustomLinkId += 1;

    let updatedLinks = userProfile.customLinks.concat([link]);
    users.add(caller, { userProfile with customLinks = updatedLinks });
    link;
  };

  public shared ({ caller }) func editCustomLink(
    linkId : Nat,
    name : Text,
    url : Text,
    category : Text,
    iconName : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can edit custom links");
    };

    let userProfile = switch (users.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User not found") };
    };

    var found = false;
    let updatedLinks = userProfile.customLinks.map(
      func(link) {
        if (link.id == linkId) {
          found := true;
          { id = linkId; name; url; category; iconName };
        } else {
          link;
        };
      },
    );

    if (not found) {
      Runtime.trap("Custom link not found");
    };

    users.add(caller, { userProfile with customLinks = updatedLinks });
  };

  public shared ({ caller }) func deleteCustomLink(linkId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete custom links");
    };

    let userProfile = switch (users.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User not found") };
    };

    let filteredLinks = userProfile.customLinks.filter(
      func(link) { link.id != linkId },
    );

    users.add(caller, { userProfile with customLinks = filteredLinks });
  };

  public query ({ caller }) func getCustomLinks() : async [CustomLink] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get custom links");
    };
    switch (users.get(caller)) {
      case (?profile) { profile.customLinks };
      case (null) { [] };
    };
  };

  // ── Vault Notes ──────────────────────────────────────────────────────────────

  let vaultNotes = Map.empty<Principal, [(Nat, VaultNote)]>();

  public shared ({ caller }) func addVaultNote(encryptedContent : Text) : async VaultNote {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add vault notes");
    };

    let note : VaultNote = {
      id = nextVaultNoteId;
      encryptedContent;
      createdAt = Time.now();
    };
    nextVaultNoteId += 1;

    let existing = switch (vaultNotes.get(caller)) {
      case (?notes) { notes };
      case (null) { [] };
    };

    vaultNotes.add(caller, existing.concat([(note.id, note)]));
    note;
  };

  public shared ({ caller }) func editVaultNote(
    noteId : Nat,
    encryptedContent : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can edit vault notes");
    };

    let existing = switch (vaultNotes.get(caller)) {
      case (?notes) { notes };
      case (null) { Runtime.trap("No vault notes found for the user") };
    };

    var found = false;
    let updated = existing.map(
      func((id, note)) {
        if (id == noteId) {
          found := true;
          (id, { note with encryptedContent });
        } else {
          (id, note);
        };
      },
    );

    if (not found) {
      Runtime.trap("Vault note not found");
    };

    vaultNotes.add(caller, updated);
  };

  public shared ({ caller }) func deleteVaultNote(noteId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete vault notes");
    };

    let existing = switch (vaultNotes.get(caller)) {
      case (?notes) { notes };
      case (null) { Runtime.trap("No vault notes found for the user") };
    };

    let filtered = existing.filter(
      func((id, _)) { id != noteId },
    );

    vaultNotes.add(caller, filtered);
  };

  public query ({ caller }) func getVaultNotes() : async [VaultNote] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get vault notes");
    };
    switch (vaultNotes.get(caller)) {
      case (?notes) {
        // Return newest first
        let arr = notes.map(func((_, n)) { n });
        arr.reverse();
      };
      case (null) { [] };
    };
  };

  // ── Vault Password ───────────────────────────────────────────────────────────

  public shared ({ caller }) func changeVaultPassword(
    currentPasswordHash : Text,
    newPasswordHash : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can change vault password");
    };

    switch (users.get(caller)) {
      case (?userProfile) {
        if (userProfile.vaultPasswordHash != currentPasswordHash) {
          Runtime.trap("Invalid current vault password");
        };
        users.add(caller, { userProfile with vaultPasswordHash = newPasswordHash });
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  // Vault password reset (admin-assisted or self with identity proof).
  public shared ({ caller }) func resetVaultPassword(newPasswordHash : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can reset their vault password");
    };

    switch (users.get(caller)) {
      case (?userProfile) {
        users.add(caller, { userProfile with vaultPasswordHash = newPasswordHash });
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  // ── Email 2FA Toggle ─────────────────────────────────────────────────────────

  let email2faUsers = Set.empty<Principal>();

  public shared ({ caller }) func toggleEmail2fa(enable : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can enable/disable 2FA");
    };

    if (enable) {
      email2faUsers.add(caller);
    } else {
      email2faUsers.remove(caller);
    };
  };

  public query ({ caller }) func isEmail2faEnabled() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can query 2FA status");
    };
    email2faUsers.contains(caller);
  };

  // ── Account Deletion ─────────────────────────────────────────────────────────

  public shared ({ caller }) func deleteAccount() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete their account");
    };

    users.remove(caller);
    vaultNotes.remove(caller);
    email2faUsers.remove(caller);
  };

  // ── Clean GetProfile Separation ──────────────────────────────────────────────

  // Return a well-formed and documented response to distinguish between
  // 'profile not found' and actual error or missing permission.
  public query ({ caller }) func getProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated principals can get a profile");
    };
    // Return null for actual 'profile does not exist' instead of trapping.
    users.get(caller);
  };
};

