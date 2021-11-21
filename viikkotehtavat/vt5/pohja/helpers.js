export function eiYliOikeanLaidan(what, where) {
  if (
    what.getBoundingClientRect().right > where.getBoundingClientRect().right
  ) {
    const w =
      what.getBoundingClientRect().right - what.getBoundingClientRect().left;
    const a =
      where.getBoundingClientRect().right - where.getBoundingClientRect().left;
    what.style.left = a - w + "px";
  }
}

export function eiYliAlaLaidan(what, where) {
  if (
    what.getBoundingClientRect().bottom > where.getBoundingClientRect().bottom
  ) {
    const h =
      what.getBoundingClientRect().bottom - what.getBoundingClientRect().top;
    const a =
      where.getBoundingClientRect().bottom - where.getBoundingClientRect().top;
    what.style.top = a - h + "px";
  }
}
