from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://scheduler:scheduler@db:5432/scheduler"

    # Authentication
    secret_key: str = "change_this_secret_key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 1 day

    # CORS
    cors_origins: str = "http://localhost:5173"    # Vite's default port

    model_config = SettingsConfigDict(env_file = ".env", extra = "ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
settings = Settings()