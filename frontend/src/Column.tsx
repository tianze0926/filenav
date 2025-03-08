import {
  createMemo,
  type Component,
  Index,
  createEffect,
  Show,
} from "solid-js";
import { DirItem } from "./client";
import { createVirtualizer } from "@tanstack/solid-virtual";
import * as icons from "./icons";

export const Column: Component<{
  items: DirItem[];
  currentIndex: number;
  set: (path: string) => void;
}> = (props) => {
  let parentRef!: HTMLDivElement;
  const virtualizer = createMemo(() =>
    createVirtualizer({
      count: props.items.length,
      getScrollElement: () => parentRef,
      estimateSize: () => 24,
    })
  );
  createEffect(() =>
    virtualizer().scrollToIndex(props.currentIndex, { align: "center" })
  );
  return (
    <div class="w-[30%] flex flex-col">
      <div>{props.items.length}</div>
      <div ref={parentRef} class=" overflow-auto">
        <div
          style={{
            height: `${virtualizer().getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          <Index each={virtualizer().getVirtualItems()}>
            {(row) => {
              const highlight = () => props.currentIndex === row().index;
              return (
                <Show when={props.items[row().index]}>
                  {(item) => (
                    <div
                      style={{
                        height: `${row().size}px`,
                        transform: `translateY(${row().start}px)`,
                      }}
                      class={`absolute top-0 left-0 w-full flex ${
                        highlight() ? "bg-info" : "hover:bg-base-200"
                      } cursor-pointer`}
                      onClick={() => props.set(item().path)}
                    >
                      <div>
                        {item().is_dir
                          ? icons.folder(highlight())
                          : icons.document()}
                      </div>
                      <div class="truncate">{item().path}</div>
                    </div>
                  )}
                </Show>
              );
            }}
          </Index>
        </div>
      </div>
    </div>
  );
};
