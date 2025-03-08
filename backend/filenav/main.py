from fastapi import Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .entrypoint import app, api
from . import api as _  # noqa: F401


app.mount("/api", api)


# https://stackoverflow.com/a/64147628
dist = "frontend-dist"
app.mount("/assets", StaticFiles(directory=f"{dist}/assets"))
templates = Jinja2Templates(directory=dist)


@app.get("/{path:path}")
async def serve_spa(request: Request, path: str):
    return templates.TemplateResponse("index.html", {"request": request})
