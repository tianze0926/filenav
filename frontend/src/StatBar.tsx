import { Component, Show } from "solid-js";
import { DirItem, Error } from "./client";

function formatSize(size: number): string {
  const units = ["B", "K", "M", "G", "T"];
  const i = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length);
  return (size / Math.pow(1024, i)).toFixed(1) + units[i];
}

export const StatBar: Component<{ file_info: DirItem | Error }> = (props) => {
  return (
    <>
      <Show
        when={props.file_info.type === "dir_item" ? props.file_info : null}
        keyed
      >
        {(file_info) => (
          <>
            <Show
              when={file_info.stat.type === "stat" ? file_info.stat : null}
              keyed
            >
              {(stat) => (
                <div class="flex justify-between font-mono">
                  <div>{new Date(stat.time_modified / 1e6).toString()}</div>
                  <div title={`${stat.size} B`}>{formatSize(stat.size)}</div>
                  <div>{`${stat.user}:${stat.group}`}</div>
                  <div>{stat.permission}</div>
                </div>
              )}
            </Show>
            <Show
              when={file_info.stat.type === "error" ? file_info.stat : null}
              keyed
            >
              {(err) => <div>{err.msg}</div>}
            </Show>
          </>
        )}
      </Show>
      <Show
        when={props.file_info.type === "error" ? props.file_info : null}
        keyed
      >
        {(err) => <div>{err.msg}</div>}
      </Show>
    </>
  );
};
