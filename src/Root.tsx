import { Composition } from "remotion";
import { FPS, TOTAL_FRAMES } from "./timeline";
import { OutlierLaunch, type LaunchProps } from "./Video";
import { SCENE_TEST_SECONDS, SceneTest } from "./scenes/SceneTest";

const defaults: LaunchProps = { motionBlur: 0, lightLeaks: false };

export function Root() {
  return (
    <>
      <Composition id="OutlierLaunch" component={OutlierLaunch} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={defaults} />
      {/* One scene on its own: quick to render, for agreeing the motion style before applying it everywhere. */}
      <Composition id="SceneTest" component={SceneTest} durationInFrames={Math.round(SCENE_TEST_SECONDS * FPS)} fps={FPS} width={1920} height={1080} />
    </>
  );
}
