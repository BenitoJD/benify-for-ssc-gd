from fastapi import HTTPException, status


class AppHTTPException(HTTPException):
    """Base application HTTP exception."""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        code: str = None,
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code


class NotFoundException(AppHTTPException):
    """Resource not found exception."""
    
    def __init__(self, resource: str = "Resource"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} not found",
            code="NOT_FOUND",
        )


class UnauthorizedException(AppHTTPException):
    """Unauthorized access exception."""
    
    def __init__(self, detail: str = "Authentication required"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code="UNAUTHORIZED",
        )


class ForbiddenException(AppHTTPException):
    """Forbidden access exception."""
    
    def __init__(self, detail: str = "Access denied"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            code="FORBIDDEN",
        )


class ConflictException(AppHTTPException):
    """Conflict exception for duplicate resources."""
    
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            code="CONFLICT",
        )


class ValidationException(AppHTTPException):
    """Validation error exception."""
    
    def __init__(self, detail: str = "Validation error"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            code="VALIDATION_ERROR",
        )


class RateLimitException(AppHTTPException):
    """Rate limit exceeded exception."""
    
    def __init__(self, detail: str = "Too many requests"):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            code="RATE_LIMIT_EXCEEDED",
        )
