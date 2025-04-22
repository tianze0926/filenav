from pathlib import Path
from urllib.parse import quote
from fastapi.responses import FileResponse

from ..entrypoint import api


@api.get("/file")
def file(path: str) -> FileResponse:
    path_ = Path(path)
    filename = quote(path_.name)  # http header does not support utf-8
    return FileResponse(
        path_,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
