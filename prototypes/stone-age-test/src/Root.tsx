import React from "react";
import { Composition } from "remotion";
import { Body, layout } from "./Body";
import { Full, framedTotal } from "./Frame";
import { FPS } from "./motion";
import storyboard from "../storyboard.json";

import type { Storyboard } from "./types";
import { MonkeyFaces, MonkeyModel } from "./sheets/MonkeySheet";
import { CastSheet } from "./sheets/CastSheet";
import { Frame1, Frame2, Frame3, Frame4, Frame5 } from "./sheets/StyleFrames";
import { StickCastSheet, StickMonkeySheet, StickSampleScene } from "./sheets/StickSheets";

/** The sample holds the first beats, so a check render costs seconds, not minutes. */
const SAMPLE = (storyboard as Storyboard).beats.slice(0, 4).map((b) => b.id);

export const Root: React.FC = () => (
  <>
    {/* Full = the video with its frame: opening card, corner logo, closing slide */}
    <Composition id="Full" component={Full} width={1920} height={1080} fps={FPS}
      durationInFrames={framedTotal()} />
    {/* Body = the same video without the frame, for the audio check and quick iterations */}
    <Composition id="Body" component={Body} width={1920} height={1080} fps={FPS}
      durationInFrames={layout().total} defaultProps={{ ids: undefined }} />
    {/* design sheets for approval (stills; a few seconds so the cycles can be previewed) */}
    <Composition id="SheetMonkey" component={MonkeyModel} width={1920} height={1080} fps={FPS} durationInFrames={90} />
    <Composition id="SheetCast" component={CastSheet} width={1920} height={1080} fps={FPS} durationInFrames={90} />
    {[Frame1, Frame2, Frame3, Frame4, Frame5].map((C, i) => (
      <Composition key={i} id={`Style${i + 1}`} component={C} width={1920} height={1080} fps={FPS} durationInFrames={90} />
    ))}
    <Composition id="StickMonkey" component={StickMonkeySheet} width={1920} height={1080} fps={FPS} durationInFrames={90} />
    <Composition id="StickScene" component={StickSampleScene} width={1920} height={1080} fps={FPS} durationInFrames={90} />
    <Composition id="StickCast" component={StickCastSheet} width={1920} height={1080} fps={FPS} durationInFrames={1} />
    <Composition id="SheetFaces" component={MonkeyFaces} width={1920} height={1080} fps={FPS} durationInFrames={1} />
    {SAMPLE.length > 0 && (
      <Composition id="Sample" component={Body} width={1920} height={1080} fps={FPS}
        durationInFrames={layout(SAMPLE).total} defaultProps={{ ids: SAMPLE }} />
    )}
  </>
);
