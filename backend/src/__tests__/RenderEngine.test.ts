import { FFmpegService } from '../services/FFmpegService';
import { RenderEngine } from '../services/RenderEngine';

describe('FFmpegService & RenderEngine Pipeline Tests', () => {
  beforeAll(() => {
    FFmpegService.initialize();
  });

  test('FFmpegService returns valid resolution profiles for 16:9 Landscape', () => {
    const profile1080p = FFmpegService.getProfile('16:9', '1080p');
    expect(profile1080p.width).toBe(1920);
    expect(profile1080p.height).toBe(1080);
    expect(profile1080p.fps).toBe(30);

    const profile4K = FFmpegService.getProfile('16:9', '4K');
    expect(profile4K.width).toBe(3840);
    expect(profile4K.height).toBe(2160);
  });

  test('FFmpegService returns valid resolution profiles for 9:16 Shorts', () => {
    const profileShorts = FFmpegService.getProfile('9:16', '1080p');
    expect(profileShorts.width).toBe(1080);
    expect(profileShorts.height).toBe(1920);
  });

  test('FFmpegService returns valid resolution profiles for 1:1 Square', () => {
    const profileSquare = FFmpegService.getProfile('1:1', '1080p');
    expect(profileSquare.width).toBe(1080);
    expect(profileSquare.height).toBe(1080);
  });

  test('RenderEngine instance is available and exports expected methods', () => {
    const engine = new RenderEngine();
    expect(engine.renderVideo).toBeDefined();
    expect(typeof engine.renderVideo).toBe('function');
  });
});
