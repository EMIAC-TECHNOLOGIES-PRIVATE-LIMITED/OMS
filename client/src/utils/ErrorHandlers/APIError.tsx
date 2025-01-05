const handleApiError = (
    error: any,
    defaultMessage: string = "An error occurred."
) => {
    let errorMessage;

    if (error.status === 403) {
        // Redirect the user to the /unauthorized route
        window.location.href = "/unauthorized";
        return; // Exit after redirecting
    }

    if (error?.response?.data?.message) {
        errorMessage =
            typeof error.response.data.message === "string"
                ? error.response.data.message
                : JSON.stringify(error.response.data.message);
    } else {
        errorMessage = defaultMessage;
    }

    return errorMessage;
};

export default handleApiError;
