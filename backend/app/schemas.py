from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    instruction: str = Field(..., min_length=1, description="Natural-language hardware description")
    temperature: float = Field(0.1, ge=0.0, le=1.0)
    max_tokens: int = Field(512, ge=1, le=2048)


class GenerateResponse(BaseModel):
    output: str
    status: str = "ok"


class HealthResponse(BaseModel):
    status: str = "ok"
    model: str = "qwen-verilog-stage4"
