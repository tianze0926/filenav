import io

from fastapi.logger import logger
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
        total_frames = video.frames
        if total_frames == 0:
            # https://stackoverflow.com/questions/53365792/number-of-frames-in-a-video-using-pyav#comment136293680_58768355
            total_frames = int(
                video.metadata.get(
                    "NUMBER_OF_FRAMES-eng", video.metadata.get("NUMBER_OF_FRAMES", "0")
                )
            )
        if total_frames == 0:
            logger.warning(
                "Got total frames as zero in %s; video.frames: %s; metadata: %s",
                video_path,
                video.frames,
                video.metadata,
            )
        frame_i = int(total_frames * PERCENTAGE)
        container.seek(int(frame_i / video.average_rate * av.time_base))
        frame = next(container.decode(video))
        for _ in range(int(frame.pts * video.time_base * video.average_rate), frame_i):
            frame = next(container.decode(video))
        return frame.to_image()
    raise AssertionError()


@api.get("/thumbnail")
def thumbnail(path: str) -> StreamingResponse:
    img = seek(path)
    buffer = io.BytesIO()
    img.save(buffer, "png")
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="image/png")
