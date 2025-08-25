const permissions = [
  {
    role: "admin",
    permissions: [
      { module: "roles", actions: ["create", "read", "update", "delete"] },
      { module: "users", actions: ["create", "read", "update", "delete"] },
      { module: "kyc-types", actions: ["create", "read", "update", "delete"] },
      { module: "kyc-methods", actions: ["create", "read", "update", "delete"] },
      { module: "rag", actions: ["create", "read", "update", "delete"] },
      { module: "chat", actions: ["create", "read", "update", "delete"] },
      { module: "analytics", actions: ["read"] },
    ]
  },
  {
    role: "dealer",
    permissions: [
      { module: "users", actions: ["create", "read", "update", "delete"] },
      { module: "address-book", actions: ["create", "read", "update", "delete"] },
      { module: "rag", actions: ["create", "read"] },
      { module: "chat", actions: ["create", "read"] },
    ]
  },
  {
    role: "user",
    permissions: [
      { module: "rag", actions: ["create", "read"] },
      { module: "chat", actions: ["create", "read"] },
    ]
  }
];

export default permissions;
