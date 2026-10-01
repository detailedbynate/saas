import { Composition } from "remotion";
import { FPS, TOTAL_FRAMES } from "./timeline";
import { OutlierLaunch, type LaunchProps } from "./Video";

const defaults: LaunchProps = { motionBlur: 0, lightLeaks: false };

export function Root() {
  return <Composition id="OutlierLaunch" component={OutlierLaunch} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={defaults} />;
}
