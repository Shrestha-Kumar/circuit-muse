from fastapi import APIRouter
from fastapi.responses import JSONResponse

from ..model_service import model_service
from ..schemas import GenerateRequest, GenerateResponse, HealthResponse

router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    try:
        output = model_service.generate(
            instruction=req.instruction,
            temperature=req.temperature,
            max_tokens=req.max_tokens,
        )
        return GenerateResponse(output=output, status="ok")
    except Exception as e:
        # Same shape + status code as the old Flask error response,
        # so the existing frontend code doesn't need to change.
        return JSONResponse(status_code=500, content={"error": str(e), "status": "error"})


@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse()
