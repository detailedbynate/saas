import { Composition } from "remotion";
import { FPS, SHOTS, type SceneId, TOTAL_FRAMES } from "./timeline";
import { OutlierLaunch, type LaunchProps, SceneTest } from "./Video";

const defaults: LaunchProps = { motionBlur: 0, lightLeaks: false };
const scene: { scene: SceneId; motionBlur: number } = { scene: "analyze", motionBlur: 0 };

export function Root() {
  return (
    <>
      <Composition id="OutlierLaunch" component={OutlierLaunch} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={defaults} />
      {/* One scene on its own: `npx remotion render SceneTest out/scene.mp4 --props='{"scene":"viral","motionBlur":0}'` */}
      <Composition
        id="SceneTest"
        component={SceneTest}
        durationInFrames={Math.round(SHOTS.analyze.dur * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={scene}
        calculateMetadata={({ props }) => ({ durationInFrames: Math.round((SHOTS[props.scene].dur + (props.scene === "intro" ? 0 : 0.2)) * FPS) })}
      />
    </>
  );
}
