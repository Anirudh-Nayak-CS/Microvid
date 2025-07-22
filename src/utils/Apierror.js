class ApiError extends Error {
  constructor(message="Error",statusCode,stack="",errors=[]) {
    super(message)
    this.statusCode=statusCode
    this.errors=errors
    this.data=null
    this.success=false
    if(stack)
      this.stack=stack
    else {
      Error.captureStackTrace(this,this.constructor)
    }
  }
}

export {ApiError}