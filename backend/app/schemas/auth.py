from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class UserInfo(BaseModel):
    id: int
    email: str
    name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo
