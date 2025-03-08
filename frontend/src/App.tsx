import {
  createSignal,
  type Component,
  Show,
  createResource,
  createEffect,
  untrack,
} from "solid-js";
import { Column } from "./Column";
import { FilePreview } from "./FilePreview";
import { client, ItemInfo, itemItemGet } from "./client";
import naturalCompare from "./naturalCompare";

client.setConfig({ baseUrl: "/api" });

class DirCache {
  map = new Map<string, string>();
  get(key: Path) {
    return this.map.get(key.str());
  }
  set(p: Path) {
    const name = p.name();
    if (name) this.map.set(p.parent().str(), name);
  }
}

// TODO: should be a signal
const dirCache = new DirCache();

type Data = ItemInfo & {
  indexes: { current: number; parent: number; preview: number };
};
const fallback = {
  current: [],
  parent: [],
  is_dir: true,
  preview: [],
  indexes: { current: -1, parent: -1, preview: -1 },
};

class Path {
  parts: string[];
  constructor(path_or_parts: string | string[]) {
    if (!Array.isArray(path_or_parts)) path_or_parts = path_or_parts.split("/");
    this.parts = path_or_parts.filter((p) => p.length > 0);
  }
  str() {
    return "/" + this.parts.join("/");
  }
  name() {
    return this.parts.at(-1);
  }
  parent() {
    return new Path(this.parts.slice(0, -1));
  }
  join(name: string) {
    return new Path(this.parts.concat(new Path(name).parts));
  }
  to_uri() {
    return "/" + this.parts.map(encodeURIComponent).join("/");
  }
  static from_uri() {
    const pathname = window.location.pathname;
    return new Path(pathname.split("/").map(decodeURIComponent));
  }
}

// TODO: abort
async function getData(path: Path): Promise<Data> {
  const result = await itemItemGet({ query: { item: path.str() } });
  if (typeof result.error !== "undefined") return fallback;
  const data = result.data;
  for (const array of [data.parent, data.current, data.preview]) {
    // TODO: other sorting
    array.sort((a, b) => naturalCompare(a.path, b.path));
  }
  const findIndex = (current: boolean) =>
    data[current ? "current" : "parent"].findIndex(
      (e) => e.path === (current ? path : path.parent()).name()
    );
  return {
    ...data,
    indexes: {
      current: findIndex(true),
      parent: findIndex(false),
      preview: (() => {
        const cachedName = dirCache.get(path);
        console.log(cachedName === "");
        if (typeof cachedName === "undefined") return 0;
        return data.preview.findIndex((e) => e.path == cachedName);
      })(),
    },
  };
}

const App: Component = () => {
  const [current, setCurrent] = createSignal(Path.from_uri());
  createEffect(() => {
    const currentPath = current();
    const pathname = currentPath.to_uri();
    if (window.location.pathname !== pathname)
      window.history.pushState(undefined, "", pathname);
    dirCache.set(currentPath);
  });
  const [data] = createResource(current, getData, { initialValue: fallback });
  createEffect(() => {
    console.log(data());
  });
  function shiftIndex(offset: number) {
    const targetIndex = data().indexes.current + offset;
    const trimmedIndex = Math.min(
      Math.max(0, targetIndex),
      data().current.length - 1
    );
    const targetName = data().current[trimmedIndex];
    if (typeof targetName === "undefined") return;
    setCurrent(current().parent().join(targetName.path));
  }
  function enter() {
    const nextName = data().preview[data().indexes.preview];
    if (typeof nextName === "undefined") return;
    setCurrent(current().join(nextName.path));
  }
  function back() {
    const parent = current().parent();
    setCurrent(parent);
  }
  const set = (base: Path) => (path: string) => setCurrent(base.join(path));

  const [play, setPlay] = createSignal(undefined, { equals: false });

  onkeydown = (event) => {
    console.log(event);
    switch (event.key) {
      case "j":
      case "ArrowDown":
        shiftIndex(1);
        break;
      case "k":
      case "ArrowUp":
        shiftIndex(-1);
        break;
      case "d":
        if (event.ctrlKey) shiftIndex(10);
        break;
      case "u":
        if (event.ctrlKey) shiftIndex(-10);
        break;
      case "l":
      case "ArrowRight":
        if (data().is_dir) enter();
        else setPlay();
        break;
      case "h":
      case "ArrowLeft":
        back();
        break;
      default:
        return;
    }
    event.preventDefault();
  };
  return (
    <div class="h-screen p-2 flex flex-col">
      <div>{current().str()}</div>
      <div class="min-h-0 grow flex items-stretch">
        <Column
          items={data().parent}
          currentIndex={data().indexes.parent}
          set={set(untrack(current).parent().parent())}
        ></Column>
        <div class="w-[4%] m-0 divider divider-horizontal"></div>
        <Column
          items={data().current}
          currentIndex={data().indexes.current}
          set={set(untrack(current).parent())}
        ></Column>
        <div class="w-[4%] m-0 divider divider-horizontal"></div>
        <Show
          when={data().is_dir}
          fallback={
            <Show when={data().current[data().indexes.current]}>
              {(file) => (
                <FilePreview
                  file={{ ...file(), path: untrack(current).to_uri() }}
                  play={play()}
                ></FilePreview>
              )}
            </Show>
          }
        >
          <Column
            items={data().preview}
            currentIndex={data().indexes.preview}
            set={set(untrack(current))}
          ></Column>
        </Show>
      </div>
    </div>
  );
};

export default App;
