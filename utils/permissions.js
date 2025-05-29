const { Role } = require("@models");

async function canManage(targetUser, currentUser) {
  const [currentRole, targetRole] = await Promise.all([
    Role.findById(currentUser.role),
    Role.findById(targetUser.role),
  ]);

  // super_admin or self-edit allowed
  if (currentRole.level < targetRole.level) return true;
  if (currentUser._id.equals(targetUser._id)) return true;

  return false;
}

async function canAccessFeature(user, featureKey) {
  // Otherwise, fetch role + permissions from DB
  const role = await Role.findByPk(user.role_id, {
    include: ["permissions"],
  });

  if (!role) return false;

  const hasFullAccess = role.permissions.some((perm) => perm.name === "*");
  if (hasFullAccess) return true;

  return role.permissions.some((perm) => perm.name === featureKey);
}

module.exports = { canManage, canAccessFeature };
