from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Central settings object. Values can be overridden via environment
    variables or a .env file (e.g. MODEL_PATH=/some/other/path),
    instead of editing source code every time something changes.
    """

    model_path: str = "/content/drive/MyDrive/qwen_verilog_stage4_final"
    max_seq_length: int = 2048
    host: str = "0.0.0.0"
    port: int = 5000

    class Config:
        env_file = ".env"


settings = Settings()
