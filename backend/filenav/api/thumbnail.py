import io

from fastapi.responses import StreamingResponse
import av
from PIL import Image

from ..entrypoint import api

PERCENTAGE = 0.1


def seek(video_path: str) -> Image.Image:
    # https://github.com/PyAV-Org/PyAV/discussions/1113#discussioncomment-5414361
    with av.open(video_path) as container:
        video = container.streams.video[0]
        assert video.average_rate is not None
        assert video.time_base is not None
        frame_i = int(video.frames * PERCENTAGE)
        container.seek(int(frame_i / video.average_rate * av.time_base))
        frame = next(container.decode(video))
        for _ in range(int(frame.pts * video.time_base * video.average_rate), frame_i):
            frame = next(container.decode(video))
        return frame.to_image()
    raise AssertionError()


@api.get("/thumbnail/{file_path:path}")
def thumbnail(file_path: str) -> StreamingResponse:
    img = seek("/" + file_path)
    buffer = io.BytesIO()
    img.save(buffer, "png")
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="image/png")
