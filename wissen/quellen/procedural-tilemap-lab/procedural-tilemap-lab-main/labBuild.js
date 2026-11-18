export const LAB_BUILD_TAG = "tilemap-lab-build30";

export function labVersionedUrl(path, tag = LAB_BUILD_TAG) {
  const url = new URL(path, import.meta.url);
  url.searchParams.set("v", tag);
  return url.href;
}
