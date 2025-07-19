const permissions = [
  {
    role: "admin",
    permissions: [
      { module: "roles", actions: ["create", "read", "update", "delete"] },
      { module: "users", actions: ["create", "read", "update", "delete"] },
      { module: "kyc-types", actions: ["create", "read", "update", "delete"] },
      { module: "kyc-methods", actions: ["create", "read", "update", "delete"] },
    ]
  },
  {
    role: "dealer",
    permissions: [
      { module: "users", actions: ["create", "read", "update", "delete"] },
      { module: "address-book", actions: ["create", "read", "update", "delete"] },
    ]
  }
];

export default permissions;
