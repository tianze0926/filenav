from fastapi.responses import FileResponse

from ..entrypoint import api


@api.get("/file")
def file(path: str) -> FileResponse:
    return FileResponse(path)
