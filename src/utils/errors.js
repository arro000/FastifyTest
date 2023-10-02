export const ONLY_ADMIN = {
	statusCode: 403,
	message: "only admin can update data for another user",
	error: "Forbidden",
};

export const NOT_FOUND = {
	statusCode: 404,
	message: "Item not found",
	error: "Not found",
};

export const NOT_UNIQUE = {
	statusCode: 409,
	message: "Item is not unique",
	error: "Conflict",
};
