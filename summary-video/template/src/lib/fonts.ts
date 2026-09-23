import {loadFont as loadSpaceGrotesk} from '@remotion/google-fonts/SpaceGrotesk';
import {loadFont as loadAudiowide} from '@remotion/google-fonts/Audiowide';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

// display: carries the argument · wordmark: D1/D2 only · body: labels + captions
export const display = loadSpaceGrotesk('normal', {weights: ['700'], subsets: ['latin']}).fontFamily;
export const wordmark = loadAudiowide('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
export const body = loadInter('normal', {weights: ['600'], subsets: ['latin']}).fontFamily;
