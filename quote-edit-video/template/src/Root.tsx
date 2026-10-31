import React from "react";
import { Composition } from "remotion";
import { H, W } from "./quoteEdit";
import { MARCUS_HAPPY_LIFE_DURATION, MarcusAureliusHappyLife } from "./edits/MarcusAureliusHappyLife";

/** One composition per edit; add a line here for each new one. */
const EDITS: [string, React.FC, number][] = [["MarcusAureliusHappyLife", MarcusAureliusHappyLife, MARCUS_HAPPY_LIFE_DURATION]];

export const RemotionRoot: React.FC = () => (
  <>
    {EDITS.map(([id, component, durationInFrames]) => (
      <Composition key={id} id={id} component={component} durationInFrames={durationInFrames} fps={30} width={W} height={H} />
    ))}
  </>
);
