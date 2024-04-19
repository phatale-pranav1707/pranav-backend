class ApiError extends Error {
    constructor(
        statusCode,
        message="something went wrong",
        errors=[],
    ){

        super(message), //-> message la override karaych ahe
        this.statusCode=statusCode,
        this.data=null,
        this.message=message,
        this.success=false,
        this.errors=errors
        

    }
}

export {ApiError}