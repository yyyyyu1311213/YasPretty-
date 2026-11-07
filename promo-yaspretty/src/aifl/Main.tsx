import { AbsoluteFill, Audio, Img, Sequence, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { PaperTitleCard } from './PaperTitleCard';
import { Caption } from './Caption';
import { FlashCut } from './FlashCut';

export const AIFL_SHOTS = {
  morning: { from: 0, duration: 180 }, card1: { from: 180, duration: 55 },
  table: { from: 235, duration: 155 }, macro: { from: 390, duration: 55 },
  card2: { from: 445, duration: 55 }, chart: { from: 500, duration: 150 },
  cardWbr: { from: 650, duration: 50 }, wbr: { from: 700, duration: 140 },
  card3: { from: 840, duration: 55 }, outro: { from: 895, duration: 190 },
} as const;
export const AIFL_TOTAL = 1085;

export const TITLE_CARDS = {
  card1: { text: '从条件出发，*找到*适合你的妆容。' },
  card2: { text: '一份方案，*每一步*都有依据。' },
  cardWbr: { text: '真实产品，*清楚*知道为什么推荐。' },
  card3: { text: '你的选择，始终由你*掌控*。' },
} as const;
export const parseWords = (text: string): { text: string; accent?: boolean }[] => text.split(/\s+/).filter(Boolean).map((word) => {
  const match = word.match(/^\*(.+)\*$/); return match ? { text: match[1], accent: true } : { text: word };
});
export const FLASH_CUTS = [AIFL_SHOTS.table.from, AIFL_SHOTS.macro.from, AIFL_SHOTS.chart.from, AIFL_SHOTS.wbr.from];
export const CAPTIONS = [
  { from: 52, duration: 44, text: 'YASPRETTY · PERSONAL BEAUTY DECISION LIBRARY' },
  { from: 262, duration: 58, text: '肤质 · 妆效 · 场景 · 预算' },
  { from: 412, duration: 42, text: '先建立条件，再生成方案' },
  { from: 520, duration: 68, text: '步骤清晰 · 理由可见 · 局限明确' },
  { from: 718, duration: 70, text: '产品事实来自受控资料库' },
  { from: 855, duration: 64, text: '可调整，也可从头重新开始' },
] as const;
export const SFX: { from: number; src: string; volume: number }[] = [
  { from: 8, src: 'transition-soft.mp3', volume: 0.32 }, { from: 62, src: 'whoosh-fast.mp3', volume: 0.38 },
  { from: 180, src: 'swoosh-quick.mp3', volume: 0.32 }, { from: 235, src: 'transition-soft.mp3', volume: 0.34 },
  { from: 284, src: 'whoosh-big.mp3', volume: 0.42 }, { from: 362, src: 'click-camera.mp3', volume: 0.36 },
  { from: 390, src: 'swoosh-quick.mp3', volume: 0.3 }, { from: 445, src: 'transition-soft.mp3', volume: 0.34 },
  { from: 516, src: 'whoosh-fast.mp3', volume: 0.35 }, { from: 650, src: 'swoosh-quick.mp3', volume: 0.3 },
  { from: 700, src: 'transition-soft.mp3', volume: 0.34 }, { from: 818, src: 'click-camera.mp3', volume: 0.34 },
  { from: 840, src: 'swoosh-quick.mp3', volume: 0.3 }, { from: 900, src: 'riser-cine.mp3', volume: 0.38 },
  { from: 960, src: 'impact-cine.mp3', volume: 0.46 }, { from: 1002, src: 'sparkle.mp3', volume: 0.25 },
];
export const sfxDuration = (_s?: { from: number; src: string }) => 72;

type CaptureProps = { src: string; duration: number; zoom?: [number, number]; x?: [number, number]; y?: [number, number]; blur?: [number, number]; tint?: string };
const Capture: React.FC<CaptureProps> = ({ src, duration, zoom = [1, 1], x = [0, 0], y = [0, 0], blur = [0, 0], tint }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0, 0.2, 1) });
  const fade = interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ overflow: 'hidden', opacity: fade, background: '#f9eee9' }}>
    <Img src={staticFile(src)} style={{ position: 'absolute', width: 1920, height: 1080, transformOrigin: '50% 50%', transform: `translate(${interpolate(t, [0, 1], x)}px, ${interpolate(t, [0, 1], y)}px) scale(${interpolate(t, [0, 1], zoom)})`, filter: `blur(${interpolate(t, [0, 1], blur)}px)` }} />
    {tint ? <AbsoluteFill style={{ background: tint, pointerEvents: 'none' }} /> : null}
  </AbsoluteFill>;
};

const BrandIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [10, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  const titleOut = interpolate(frame, [66, 82], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ background: '#f6e9e5' }}>
    <Capture src="captures/home.png" duration={180} zoom={[1.05, 1.12]} x={[0, -22]} y={[20, -26]} blur={[4, 0]} />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: titleIn * titleOut, pointerEvents: 'none' }}>
      <div style={{ textAlign: 'center', color: '#77484e' }}><div style={{ fontFamily: 'Georgia, serif', fontSize: 112, fontWeight: 600 }}>YasPretty</div><div style={{ width: 280, height: 5, background: '#b66778', margin: '24px auto 22px' }} /><div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 24, letterSpacing: '0.2em' }}>PERSONAL BEAUTY DECISION LIBRARY</div></div>
    </AbsoluteFill>
  </AbsoluteFill>;
};
const AssistantScene: React.FC<{ duration: number }> = ({ duration }) => <Capture src="captures/assistant.png" duration={duration} zoom={[1.02, 1.15]} x={[0, -34]} y={[0, -42]} tint="rgba(255,245,241,.08)" />;
const WorkbenchScene: React.FC<{ duration: number }> = ({ duration }) => <Capture src="captures/workbench.png" duration={duration} zoom={[1.05, 1.12]} x={[0, -28]} y={[12, -18]} />;
const LibraryScene: React.FC<{ duration: number }> = ({ duration }) => <Capture src="captures/library.png" duration={duration} zoom={[1.02, 1.13]} x={[0, -30]} y={[0, -22]} />;
const DetailScene: React.FC<{ duration: number }> = ({ duration }) => <Capture src="captures/detail.png" duration={duration} zoom={[1.06, 1.18]} x={[0, -36]} y={[6, -28]} />;
const OutroScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const inT = interpolate(frame, [0, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  const logoT = interpolate(frame, [46, 76], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  const fade = interpolate(frame, [duration - 16, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ background: '#f6e9e5', opacity: fade }}><AbsoluteFill style={{ opacity: 0.42 * inT, transform: `scale(${1.06 - inT * 0.06})`, filter: `blur(${(1 - inT) * 8}px)` }}><Img src={staticFile('captures/workbench.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></AbsoluteFill><AbsoluteFill style={{ background: 'rgba(246,233,229,.72)' }} /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: logoT }}><div style={{ textAlign: 'center', color: '#77484e' }}><div style={{ fontFamily: 'Georgia, serif', fontSize: 134, fontWeight: 600 }}>YasPretty</div><div style={{ width: 360, height: 6, background: '#b66778', margin: '26px auto 24px', transform: `scaleX(${logoT})` }} /><div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 25, letterSpacing: '0.16em', color: '#8b6d70' }}>让每一次选择，都更像你</div></div></AbsoluteFill></AbsoluteFill>;
};

export const AiflMain: React.FC = () => <AbsoluteFill style={{ background: '#f6e9e5' }}>
  {SFX.map((s, i) => <Sequence key={i} from={s.from} durationInFrames={sfxDuration(s)}><Audio src={staticFile(`audio/${s.src}`)} volume={s.volume} /></Sequence>)}
  <Sequence from={AIFL_SHOTS.morning.from} durationInFrames={AIFL_SHOTS.morning.duration}><BrandIntro /></Sequence>
  <Sequence from={AIFL_SHOTS.card1.from} durationInFrames={AIFL_SHOTS.card1.duration}><PaperTitleCard duration={AIFL_SHOTS.card1.duration} words={parseWords(TITLE_CARDS.card1.text)} /></Sequence>
  <Sequence from={AIFL_SHOTS.table.from} durationInFrames={AIFL_SHOTS.table.duration}><AssistantScene duration={AIFL_SHOTS.table.duration} /></Sequence>
  <Sequence from={AIFL_SHOTS.macro.from} durationInFrames={AIFL_SHOTS.macro.duration}><DetailScene duration={AIFL_SHOTS.macro.duration} /></Sequence>
  <Sequence from={AIFL_SHOTS.card2.from} durationInFrames={AIFL_SHOTS.card2.duration}><PaperTitleCard duration={AIFL_SHOTS.card2.duration} words={parseWords(TITLE_CARDS.card2.text)} /></Sequence>
  <Sequence from={AIFL_SHOTS.chart.from} durationInFrames={AIFL_SHOTS.chart.duration}><WorkbenchScene duration={AIFL_SHOTS.chart.duration} /></Sequence>
  <Sequence from={AIFL_SHOTS.cardWbr.from} durationInFrames={AIFL_SHOTS.cardWbr.duration}><PaperTitleCard duration={AIFL_SHOTS.cardWbr.duration} words={parseWords(TITLE_CARDS.cardWbr.text)} /></Sequence>
  <Sequence from={AIFL_SHOTS.wbr.from} durationInFrames={AIFL_SHOTS.wbr.duration}><LibraryScene duration={AIFL_SHOTS.wbr.duration} /></Sequence>
  <Sequence from={AIFL_SHOTS.card3.from} durationInFrames={AIFL_SHOTS.card3.duration}><PaperTitleCard duration={AIFL_SHOTS.card3.duration} words={parseWords(TITLE_CARDS.card3.text)} /></Sequence>
  <Sequence from={AIFL_SHOTS.outro.from} durationInFrames={AIFL_SHOTS.outro.duration}><OutroScene duration={AIFL_SHOTS.outro.duration} /></Sequence>
  {CAPTIONS.map((c) => <Sequence key={c.from} from={c.from} durationInFrames={c.duration}><Caption text={c.text} duration={c.duration} /></Sequence>)}
  {FLASH_CUTS.map((cut) => <Sequence key={cut} from={cut - 5} durationInFrames={10}><FlashCut duration={10} /></Sequence>)}
</AbsoluteFill>;
