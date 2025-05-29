const RoleService = require("@services/role.service");
const { successResponse, errorResponse } = require("@helper/response");

exports.index = async (req, res) => {
  try {
    const roles = await RoleService.getAllRoles();
    successResponse(req, res, "Roles fetched successfully", roles);
  } catch (error) {
    errorResponse(req, res, error.message);
  }
};

exports.show = async (req, res) => {
  try {
    const role = await RoleService.getRoleById(req.params.id);
    if (!role) return errorResponse(req, res, "Role not found", 404);
    successResponse(req, res, "Role fetched successfully", role);
  } catch (error) {
    errorResponse(req, res, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const role = await RoleService.createRole(req.body);
    successResponse(req, res, "Role created successfully", role);
  } catch (error) {
    errorResponse(req, res, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const role = await RoleService.updateRole(req.params.id, req.body);
    successResponse(req, res, "Role updated successfully", role);
  } catch (error) {
    errorResponse(req, res, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    await RoleService.deleteRole(req.params.id);
    successResponse(req, res, "Role deleted successfully");
  } catch (error) {
    errorResponse(req, res, error.message);
  }
};
