import { Component, createSignal, Match, Switch, untrack } from "solid-js";
import { DirItem } from "./client";

export const FilePreview: Component<{
  file: DirItem;
  play: undefined;
}> = (props) => {
  const mime = () => {
    const mime = props.file.mime;
    return mime.split("/")[0];
  };
  const url = () => "/api/file" + props.file.path;
  const externalSchemeKey = "externalSchemeKey";
  if (!localStorage.getItem(externalSchemeKey))
    localStorage.setItem(externalSchemeKey, "potplayer");
  const [externalScheme, setExternalScheme] = createSignal(
    localStorage.getItem(externalSchemeKey) as string
  );
  return (
    <div class="w-[30%] flex flex-col space-y-1">
      <div class="flex mb-1">
        <button
          class="btn mr-1"
          onclick={() => {
            location.href = externalScheme() + "://" + location.origin + url();
          }}
        >
          Open using:{" "}
        </button>
        <label></label>
        <input
          class="input input-bordered"
          value={untrack(externalScheme)}
          oninput={(e) => {
            setExternalScheme(e.target.value);
            localStorage.setItem(externalSchemeKey, e.target.value);
          }}
          onkeydown={(e) => e.stopPropagation()}
        ></input>
      </div>
      <Switch
        fallback={
          <div>
            file:{" "}
            <a href={url()} target="_blank" class="link">
              {props.file.path}
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
