app = None


def run():
    import os
    import sys

    import uvicorn

    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    from .main import app as _app  # essential to import after chdir

    global app
    app = _app

    sys.argv = ["uvicorn", "filenav:app", "--app-dir", ".."] + sys.argv[1:]
    sys.exit(uvicorn.main())
