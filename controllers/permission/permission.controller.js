const PermissionService = require("@services/permission.service");
const { successResponse, errorResponse } = require("@helper/response");

exports.createPermission = async (req, res) => {
  try {
    const result = await PermissionService.create(req.body);
    return successResponse(req, res, "Permission created successfully", result);
  } catch (error) {
    return errorResponse(req, res, error.message, error.statusCode || 500);
  }
};

exports.getAllPermissions = async (req, res) => {
  try {
    const result = await PermissionService.getAll();
    return successResponse(
      req,
      res,
      "Permissions fetched successfully",
      result
    );
  } catch (error) {
    return errorResponse(req, res, error.message, error.statusCode || 500);
  }
};

exports.getPermissionById = async (req, res) => {
  try {
    const result = await PermissionService.getById(req.params.id);
    if (!result) return errorResponse(req, res, "Permission not found", 404);
    return successResponse(req, res, "Permission fetched successfully", result);
  } catch (error) {
    return errorResponse(req, res, error.message, error.statusCode || 500);
  }
};

exports.updatePermission = async (req, res) => {
  try {
    const result = await PermissionService.update(req.params.id, req.body);
    if (!result) return errorResponse(req, res, "Permission not found", 404);
    return successResponse(req, res, "Permission updated successfully", result);
  } catch (error) {
    return errorResponse(req, res, error.message, error.statusCode || 500);
  }
};

exports.deletePermission = async (req, res) => {
  try {
    const result = await PermissionService.remove(req.params.id);
    if (!result) return errorResponse(req, res, "Permission not found", 404);
    return successResponse(req, res, "Permission deleted successfully");
  } catch (error) {
    return errorResponse(req, res, error.message, error.statusCode || 500);
  }
};
