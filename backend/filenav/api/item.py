from pathlib import Path
import mimetypes

from pydantic import BaseModel

from ..entrypoint import api


class DirItem(BaseModel):
    is_dir: bool
    path: str
    mime: str


def get_is_dir(path: Path):
    try:
        is_dir = path.is_dir()
    except OSError as e:
        if e.errno != 107:
            raise e
        is_dir = False
    return is_dir


def list_dir(path: Path):
    out: list[DirItem] = []
    try:
        for file in path.iterdir():
            out.append(
                DirItem(
                    is_dir=get_is_dir(file),
                    path=str(file.relative_to(path)),
                    mime=mimetypes.guess_type(file)[0] or "",
                )
            )
    except PermissionError as e:
        # TODO: use another data structure to store error info
        return [DirItem(is_dir=False, path="/" + e.strerror, mime="")]
    return out


class ItemInfo(BaseModel):
    current: list[DirItem]
    parent: list[DirItem]
    is_dir: bool
    preview: list[DirItem]


@api.get("/item")
def item(item: str) -> ItemInfo:
    path = Path(item)
    is_dir = get_is_dir(path)

    def list_parent_dir(path: Path):
        return [] if path == Path("/") else list_dir(path.parent)

    return ItemInfo(
        current=list_parent_dir(path),
        parent=list_parent_dir(path.parent),
        is_dir=is_dir,
        preview=list_dir(path) if is_dir else [],
    )
