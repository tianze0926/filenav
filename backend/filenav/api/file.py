from fastapi.responses import FileResponse

from ..entrypoint import api


@api.get("/file/{file_path:path}")
def file(file_path: str) -> FileResponse:
    return FileResponse("/" + file_path)
