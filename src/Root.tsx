import { Composition } from "remotion";
import { FPS, TOTAL_FRAMES } from "./timeline";
import { OutlierLaunch } from "./Video";

export function Root() {
  return <Composition id="OutlierLaunch" component={OutlierLaunch} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />;
}
