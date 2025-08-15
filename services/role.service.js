const { Role } = require("@models/index");

class RoleService {
  static async createRole(data) {
    const { name, level, permission_ids } = data;

    // Create role
    const role = await Role.create({ name, level });

    // Assign permissions if any
    if (permission_ids && permission_ids.length > 0) {
      await role.setPermissions(permission_ids);
    }

    return role;
  }

  static async getAllRoles() {
    return await Role.findAll({
      include: ["permissions"],
      order: [["level", "ASC"]],
    });
  }

  static async getRoleById(id) {
    return await Role.findByPk(id, {
      include: ["permissions"],
    });
  }

  static async updateRole(id, data) {
    const role = await Role.findByPk(id);
    if (!role) throw new Error("Role not found");

    // Update basic fields
    if (data.name !== undefined) role.name = data.name;
    if (data.level !== undefined) role.level = data.level;

    await role.save();

    // Update permissions if provided
    if (data.permission_ids) {
      await role.setPermissions(data.permission_ids);
    }

    return role;
  }

  static async deleteRole(id) {
    const role = await Role.findByPk(id);
    if (!role) throw new Error("Role not found");

    // Optional: check if system role, disallow delete
    if (role.is_system_role) throw new Error("Cannot delete system role");

    await role.destroy();
    return true;
  }
}

module.exports = RoleService;
