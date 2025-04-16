from pathlib import Path
from fastapi.responses import FileResponse

from ..entrypoint import api


@api.get("/file")
def file(path: str) -> FileResponse:
    path_ = Path(path)
    return FileResponse(
        path_,
        headers={
            "Content-Disposition": f'attachment; filename="{path_.name}"',
        },
    )
