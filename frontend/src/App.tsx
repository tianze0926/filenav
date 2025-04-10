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
import { client, ItemInfo, itemItemGet, DirItem, Error } from "./client";
import naturalCompare from "./naturalCompare";
import { Path, DirCache } from "./utils";
import { StatBar } from "./StatBar";
import { makePersisted } from "@solid-primitives/storage";

// TODO: should be a signal
const dirCache = new DirCache();

client.setConfig({ baseUrl: "/api" });

type Data = ItemInfo & {
  indexes: { current: number; parent: number; preview: number };
};
const fallback: Data = {
  current: [],
  parent: [],
  file_info: { type: "error", msg: "" },
  preview: [],
  indexes: { current: -1, parent: -1, preview: -1 },
};

// TODO: abort
async function getData(path: Path): Promise<Data> {
  const result = await itemItemGet({ query: { item: path.toString() } });
  if (typeof result.error !== "undefined") throw result.error;
  const data = result.data;
  for (const array of [data.parent, data.current, data.preview]) {
    if (!Array.isArray(array)) continue;
    // TODO: other sorting
    array.sort((a, b) => naturalCompare(a.path, b.path));
  }
  const findIndex = (col: DirItem[] | Error, name: string) => {
    if (!Array.isArray(col)) return -1;
    return col.findIndex((e) => e.path === name);
  };
  return {
    ...data,
    indexes: {
      current: findIndex(data.current, path.name()),
      parent: findIndex(data.parent, path.parent().name()),
      preview: (() => {
        const cachedName = dirCache.get(path);
        if (typeof cachedName === "undefined") return 0;
        return findIndex(data.preview, cachedName);
      })(),
    },
  };
}

const App: Component = () => {
  const pathQuery = "path";
  const [current, setCurrent] = createSignal(
    new Path(
      new URL(window.location.toString()).searchParams.get(pathQuery) || "/"
    )
  );
  createEffect(() => {
    const currentPath = current();
    dirCache.set(currentPath);
    let url = new URL(window.location.toString());
    url.searchParams.set(pathQuery, currentPath.toString());
    window.history.pushState(undefined, "", url);
  });
  const [data] = createResource(current, getData, { initialValue: fallback });
  const currentIsDir = () => {
    const item = data().file_info;
    if (item.type == "error") return true;
    if (item.stat.type == "error") return true;
    return item.stat.is_dir;
  };
  function shiftIndex(offset: number) {
    const currentCol = data().current;
    if (!Array.isArray(currentCol)) return;
    const targetIndex = data().indexes.current + offset;
    const trimmedIndex = Math.min(
      Math.max(0, targetIndex),
      currentCol.length - 1
    );
    const targetName = currentCol[trimmedIndex];
    if (typeof targetName === "undefined") return;
    setCurrent(current().parent().join(targetName.path));
  }
  function enter() {
    const previewCol = data().preview;
    if (!Array.isArray(previewCol)) return;
    const nextName = previewCol[data().indexes.preview];
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
        if (currentIsDir()) enter();
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
  let inputPath: HTMLInputElement;
  return (
    <div class="h-screen p-2 flex flex-col">
      <form
        class="join mb-1"
        onSubmit={(e) => {
          e.preventDefault();
          const v = inputPath!.value;
          if (v) setCurrent(new Path(v));
        }}
      >
        <input
          type="text"
          class="join-item input grow"
          ref={inputPath!}
          value={current().toString()}
        />
        <button class="join-item btn">Go</button>
      </form>
      <div class="min-h-0 grow flex items-stretch">
        <Column
          items={data().parent}
          currentIndex={data().indexes.parent}
          set={set(untrack(current).parent().parent())}
        ></Column>
        <div class="!w-[2%] m-0 divider divider-horizontal"></div>
        <Column
          items={data().current}
          currentIndex={data().indexes.current}
          set={set(untrack(current).parent())}
        ></Column>
        <div class="!w-[2%] m-0 divider divider-horizontal"></div>
        <Show
          when={currentIsDir()}
          fallback={
            <Show
              when={((col: DirItem[] | Error) =>
                Array.isArray(col) ? col[data().indexes.current] : null)(
                data().current
              )}
            >
              {(file) => (
                <FilePreview
                  file={{ ...file(), path: untrack(current) }}
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
      <StatBar file_info={data().file_info} />
    </div>
  );
};

export default App;
