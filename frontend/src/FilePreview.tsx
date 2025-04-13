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
import { makePersisted } from "@solid-primitives/storage";

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
  const searchParams = () =>
    new URLSearchParams({
      path: props.file.path.toString(),
    });
  const url = () => "/api/file?" + searchParams();
  const [urlScheme, setUrlScheme] = makePersisted(createSignal(""), {
    name: "urlScheme",
  });

  return (
    <div class="w-[32%] flex flex-col space-y-1">
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
      <div>
        Download:{" "}
        <a href={url()} target="_blank" class="link">
          {props.file.path.toString()}
        </a>
      </div>
      <Switch>
        <Match when={mime() == "video"}>
          <img src={"/api/thumbnail?" + searchParams()}></img>
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
