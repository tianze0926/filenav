import {
  createMemo,
  type Component,
  Index,
  createEffect,
  Show,
  Match,
  Switch,
} from "solid-js";
import { DirItem, Error } from "./client";
import { createVirtualizer } from "@tanstack/solid-virtual";
import * as icons from "./icons";

export const Column: Component<{
  items: DirItem[] | Error;
  currentIndex: number;
  set: (path: string) => void;
}> = (props) => {
  let parentRef!: HTMLDivElement;
  const ctx = () =>
    Array.isArray(props.items)
      ? {
          type: "col" as "col",
          items: props.items,
          virtualizer: createVirtualizer({
            count: props.items.length,
            getScrollElement: () => parentRef,
            estimateSize: () => 24,
          }),
        }
      : {
          type: "err" as "err",
          err: props.items,
        };
  createEffect(() => {
    const _ctx = ctx();
    if (_ctx.type == "col")
      _ctx.virtualizer.scrollToIndex(props.currentIndex, { align: "center" });
  });
  return (
    <div class="w-[32%] flex flex-col">
      <Switch>
        <Match
          when={(() => {
            const _ctx = ctx();
            return _ctx.type == "err" ? _ctx : null;
          })()}
          keyed
        >
          {(ctx) => <div>{ctx.err.msg}</div>}
        </Match>
        <Match
          when={(() => {
            const _ctx = ctx();
            return _ctx.type == "col" ? _ctx : null;
          })()}
          keyed
        >
          {(ctx) => (
            <>
              <div>{ctx.items.length}</div>
              <div ref={parentRef} class=" overflow-auto">
                <div
                  style={{
                    height: `${ctx.virtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  <Index each={ctx.virtualizer.getVirtualItems()}>
                    {(row) => {
                      const highlight = () =>
                        props.currentIndex === row().index;
                      return (
                        <Show when={ctx.items[row().index]} keyed>
                          {(item) => (
                            <div
                              style={{
                                height: `${row().size}px`,
                                transform: `translateY(${row().start}px)`,
                              }}
                              class={`absolute top-0 left-0 w-full flex ${
                                highlight() ? "bg-info" : "hover:bg-base-200"
                              } cursor-pointer`}
                              onClick={() => props.set(item.path)}
                            >
                              <div>
                                {(
                                  item.stat.type == "stat"
                                    ? item.stat.is_dir
                                    : false
                                )
                                  ? icons.folder(highlight())
                                  : icons.document()}
                              </div>
                              <div class="truncate">{item.path}</div>
                            </div>
                          )}
                        </Show>
                      );
                    }}
                  </Index>
                </div>
              </div>
            </>
          )}
        </Match>
      </Switch>
    </div>
  );
};
