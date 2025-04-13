export class DirCache {
  map = new Map<string, string>();
  get(key: Path) {
    return this.map.get(key.toString());
  }
  set(p: Path) {
    const name = p.name();
    if (name) this.map.set(p.parent().toString(), name);
  }
}

export class Path {
  parts: string[];
  constructor(path_or_parts: string | string[]) {
    if (!Array.isArray(path_or_parts)) path_or_parts = path_or_parts.split("/");
    this.parts = path_or_parts.filter((p) => p.length > 0);
  }
  toString() {
    return "/" + this.parts.join("/");
  }
  name() {
    return this.parts.at(-1) || "";
  }
  parent() {
    return new Path(this.parts.slice(0, -1));
  }
  join(name: string) {
    return new Path(this.parts.concat(new Path(name).parts));
  }
}
