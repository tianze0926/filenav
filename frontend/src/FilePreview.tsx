import {
  Component,
  createEffect,
  createSignal,
  For,
  Match,
  Switch,
} from "solid-js";
import { DirItem } from "./client";
import { Path } from "./utils";

const openUrlScheme: Record<string, (url: string) => string> = {
  IINA: (url) => `iina://weblink?${new URLSearchParams({ url: url })}`,
  Potplayer: (url) => `potplayer://${url}`,
};

export const FilePreview: Component<{
  file: Omit<DirItem, "path"> & { path: Path };
  play: undefined;
}> = (props) => {
  const mime = () => {
    const mime = props.file.mime;
    return mime.split("/")[0];
  };
  const url = () => "/api/file" + props.file.path.to_uri();
  const urlSchemeKey = "urlSchemeKey";
  const [urlScheme, setUrlScheme] = createSignal(
    localStorage.getItem(urlSchemeKey) || ""
  );
  createEffect(() => {
    const v = urlScheme();
    if (v) localStorage.setItem(urlSchemeKey, v);
  });

  return (
    <div class="w-[30%] flex flex-col space-y-1">
      <div class="flex mb-1">
        <button
          class="btn mr-1"
          onclick={() => {
            const fn = openUrlScheme[urlScheme()];
            if (fn) location.href = fn(location.origin + url());
          }}
        >
          Open using:{" "}
        </button>
        <select
          class="select"
          value={urlScheme()}
          onChange={(e) => setUrlScheme(e.target.value)}
        >
          <For each={Object.keys(openUrlScheme)}>
            {(item, index) => <option>{item}</option>}
          </For>
        </select>
      </div>
      <Switch
        fallback={
          <div>
            file:{" "}
            <a href={url()} target="_blank" class="link">
              {props.file.path.toString()}
            </a>
          </div>
        }
      >
        <Match when={mime() == "video"}>
          <img src={"/api/thumbnail" + props.file.path}></img>
          <video controls preload="none" src={url()}></video>
        </Match>
        <Match when={mime() == "audio"}>
          <audio controls preload="none" src={url()}></audio>
        </Match>
        <Match when={mime() == "image"}>
          <img src={url()}></img>
        </Match>
      </Switch>
    </div>
  );
};
