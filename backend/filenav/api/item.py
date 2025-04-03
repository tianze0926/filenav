from typing import Literal
from pathlib import Path
import mimetypes
import os
import pwd
import grp
import stat

from pydantic import BaseModel, Field, ConfigDict

from ..entrypoint import api


class Stat(BaseModel):
    model_config = ConfigDict(json_schema_serialization_defaults_required=True)
    type: Literal["stat"] = "stat"
    is_dir: bool
    time_modified: int
    size: int
    user: str
    group: str
    permission: str

    @classmethod
    def from_stat(cls, stat_result: os.stat_result):
        return cls(
            is_dir=stat.S_ISDIR(stat_result.st_mode),
            time_modified=stat_result.st_mtime_ns,
            size=stat_result.st_size,
            user=name_from_id(stat_result.st_uid, True),
            group=name_from_id(stat_result.st_gid, False),
            permission=stat.filemode(stat_result.st_mode),
        )


class Error(BaseModel):
    model_config = ConfigDict(json_schema_serialization_defaults_required=True)
    type: Literal["error"] = "error"
    msg: str


class DirItem(BaseModel):
    model_config = ConfigDict(json_schema_serialization_defaults_required=True)
    type: Literal["dir_item"] = "dir_item"
    path: str
    mime: str
    symlink: str
    stat: Stat | Error = Field(discriminator="type")


def name_from_id(uid_gid: int, is_uid: bool):
    f = pwd.getpwuid if is_uid else grp.getgrgid
    try:
        return f(uid_gid)[0]
    except KeyError:
        return str(uid_gid)


def get_dir_item(file: Path):
    try:
        stat = file.stat()
        stat = Stat.from_stat(stat)
    except Exception as e:
        stat = Error(msg=str(e))
    return DirItem(
        path=str(file.name),
        mime=mimetypes.guess_type(file)[0] or "",
        symlink=str(file.readlink()) if file.is_symlink() else "",
        stat=stat,
    )


def list_dir(path: Path):
    try:
        return [get_dir_item(file) for file in path.iterdir()]
    except PermissionError as e:
        return Error(msg=f"list_dir {e} {e.strerror}")


class ItemInfo(BaseModel):
    current: list[DirItem] | Error
    parent: list[DirItem] | Error
    file_info: DirItem | Error = Field(discriminator="type")
    preview: list[DirItem] | Error


def get_preview(file_info: DirItem | Error, path: Path):
    if file_info.type == "error":
        return file_info
    if file_info.stat.type == "error":
        return file_info.stat
    if file_info.stat.is_dir:
        return list_dir(path)
    return []


@api.get("/item")
def item(item: str) -> ItemInfo:
    path = Path(item)

    def list_parent_dir(path: Path):
        return [get_dir_item(path)] if path == Path("/") else list_dir(path.parent)

    col_current = list_parent_dir(path)
    file_info = (
        next(
            (f for f in col_current if f.path == path.name),
            Error(msg="file does not exist anymore"),
        )
        if isinstance(col_current, list)
        else col_current
    )

    return ItemInfo(
        current=col_current,
        parent=list_parent_dir(path.parent),
        file_info=file_info,
        preview=get_preview(file_info, path),
    )
