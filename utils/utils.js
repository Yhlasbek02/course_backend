function handleServerError(res, error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
}

function handleNotFound(res, entity = "Resource") {
    res.status(404).json({ message: `${entity} not found` });
}

function fieldRequired(res) {
    res.status(400).json({ message: "Fields are required" });
}

function response(res, data, message) {
    res.status(200).json({message, data});
}

module.exports = { handleServerError, handleNotFound, fieldRequired, response };
