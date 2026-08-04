import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { FFmpegService, AspectRatio, QualityResolution } from './FFmpegService';
import { logger } from '../config/logger';

export interface RenderSceneInput {
  sceneNumber: number;
  mediaUrl?: string; // Image or video clip URL/file
  mediaType: 'image' | 'video';
  durationSeconds: number;
  narrationAudioUrl?: string;
  subtitleText?: string;
  transition?: 'fade' | 'crossfade' | 'wipeleft' | 'wiperight' | 'none';
  motionEffect?: 'kenburns_zoom_in' | 'kenburns_zoom_out' | 'pan_left' | 'pan_right' | 'none';
}

export interface RenderPipelineOptions {
  projectId: string;
  outputPath: string;
  scenes: RenderSceneInput[];
  aspectRatio?: AspectRatio;
  resolution?: QualityResolution;
  backgroundMusicUrl?: string;
  backgroundMusicVolume?: number; // 0.0 - 1.0 (default 0.15)
  enableAudioDucking?: boolean;
  watermarkText?: string;
  subtitlesSrtPath?: string;
  onProgress?: (progressPercent: number, message: string) => void;
}

export interface RenderPipelineResult {
  outputPath: string;
  durationSeconds: number;
  resolution: string;
  fileSizeBytes: number;
  renderedAt: string;
}

export class RenderEngine {
  /**
   * Execute complete end-to-end video render pipeline.
   */
  async renderVideo(options: RenderPipelineOptions): Promise<RenderPipelineResult> {
    const start = Date.now();
    FFmpegService.initialize();

    const {
      outputPath,
      scenes,
      aspectRatio = '16:9',
      resolution = '1080p',
      backgroundMusicUrl,
      backgroundMusicVolume = 0.15,
      enableAudioDucking = true,
      watermarkText,
      subtitlesSrtPath,
      onProgress,
    } = options;

    logger.info(`[RenderEngine] Starting render for project ${options.projectId} (${scenes.length} scenes, ${aspectRatio}, ${resolution})`);
    onProgress?.(5, 'Initializing FFmpeg pipeline...');

    const profile = FFmpegService.getProfile(aspectRatio, resolution);
    const tempDir = path.join(path.dirname(outputPath), `temp_${options.projectId}_${Date.now()}`);

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    try {
      // Step 1: Render individual scene video clips
      onProgress?.(15, 'Rendering scene clips & applying motion effects...');
      const renderedClipPaths: string[] = [];
      let totalDuration = 0;

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const clipPath = path.join(tempDir, `scene_${scene.sceneNumber}.mp4`);
        await this.renderSingleScene(scene, clipPath, profile, tempDir);
        renderedClipPaths.push(clipPath);
        totalDuration += scene.durationSeconds;

        const sceneProgress = 15 + Math.round(((i + 1) / scenes.length) * 45);
        onProgress?.(sceneProgress, `Rendered scene ${i + 1}/${scenes.length}`);
      }

      // Step 2: Build FFmpeg command to stitch clips and mix audio
      onProgress?.(65, 'Stitching scenes & processing audio pipeline...');
      const concatenatedPath = path.join(tempDir, 'stitched.mp4');
      await this.concatenateClips(renderedClipPaths, concatenatedPath, tempDir);

      // Step 3: Audio mixing (Narration + Background Music + Ducking)
      onProgress?.(80, 'Mixing audio tracks & applying dynamic ducking...');
      const audioMixedPath = path.join(tempDir, 'audio_mixed.mp4');
      await this.mixAudioTracks({
        videoInputPath: concatenatedPath,
        outputPath: audioMixedPath,
        backgroundMusicUrl,
        backgroundMusicVolume,
        enableAudioDucking,
        totalDuration,
      });

      // Step 4: Final Pass (Subtitles + Watermark + Profile Encoding)
      onProgress?.(90, 'Encoding final output & subtitles...');
      await this.applyFinalPass({
        inputPath: fs.existsSync(audioMixedPath) ? audioMixedPath : concatenatedPath,
        outputPath,
        subtitlesSrtPath,
        watermarkText,
        profile,
        onProgress: (p) => {
          const finalPercent = 90 + Math.round((p / 100) * 10);
          onProgress?.(finalPercent, `Final encoding ${p}%`);
        },
      });

      const stats = fs.statSync(outputPath);
      logger.info(`[RenderEngine] Render completed in ${((Date.now() - start) / 1000).toFixed(1)}s -> ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

      onProgress?.(100, 'Render complete!');

      return {
        outputPath,
        durationSeconds: totalDuration,
        resolution: `${profile.width}x${profile.height}`,
        fileSizeBytes: stats.size,
        renderedAt: new Date().toISOString(),
      };
    } finally {
      // Cleanup temporary directory
      this.cleanDirectory(tempDir);
    }
  }

  /**
   * Render a single scene with Ken Burns motion effect or video scaling.
   */
  private renderSingleScene(
    scene: RenderSceneInput,
    outputPath: string,
    profile: ReturnType<typeof FFmpegService.getProfile>,
    tempDir: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = ffmpeg();
      const isImage = scene.mediaType === 'image' || !scene.mediaUrl || scene.mediaUrl.endsWith('.jpg') || scene.mediaUrl.endsWith('.png');

      if (isImage) {
        // Image input: create video stream with duration
        const imagePath = scene.mediaUrl && fs.existsSync(scene.mediaUrl)
          ? scene.mediaUrl
          : this.createFallbackColorImage(profile.width, profile.height, tempDir, scene.sceneNumber);

        cmd.input(imagePath).loop(scene.durationSeconds);

        // Build Ken Burns filter graph
        const filter = this.buildKenBurnsFilter(
          scene.motionEffect || 'kenburns_zoom_in',
          profile.width,
          profile.height,
          scene.durationSeconds,
          profile.fps
        );
        cmd.complexFilter(filter);
      } else {
        // Video input
        cmd.input(scene.mediaUrl!);
        cmd.videoFilters([
          `scale=${profile.width}:${profile.height}:force_original_aspect_ratio=decrease`,
          `pad=${profile.width}:${profile.height}:(ow-iw)/2:(oh-ih)/2:black`,
        ]);
        cmd.duration(scene.durationSeconds);
      }

      // Add narration audio if provided
      if (scene.narrationAudioUrl && fs.existsSync(scene.narrationAudioUrl)) {
        cmd.input(scene.narrationAudioUrl);
      } else {
        // Silent audio stream
        cmd.input('anullsrc=channel_layout=stereo:sample_rate=44100').inputOptions('-f lavfi');
      }

      cmd
        .outputOptions([
          '-c:v libx264',
          '-preset fast',
          '-pix_fmt yuv420p',
          `-r ${profile.fps}`,
          '-c:a aac',
          `-b:a ${profile.audioBitrate}`,
          '-shortest',
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`[RenderEngine] Scene ${scene.sceneNumber} failed: ${err.message}`)))
        .run();
    });
  }

  /**
   * Build Ken Burns pan & zoom filter string.
   */
  private buildKenBurnsFilter(
    effect: string,
    width: number,
    height: number,
    duration: number,
    fps: number
  ): string {
    const totalFrames = Math.max(1, duration * fps);

    switch (effect) {
      case 'kenburns_zoom_out':
        return `scale=8000:-1,zoompan=z='max(1.5-0.5*on/${totalFrames},1.0)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
      case 'pan_left':
        return `scale=8000:-1,zoompan=z='1.2':x='(1-on/${totalFrames})*(iw-iw/zoom)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
      case 'pan_right':
        return `scale=8000:-1,zoompan=z='1.2':x='(on/${totalFrames})*(iw-iw/zoom)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
      case 'kenburns_zoom_in':
      default:
        return `scale=8000:-1,zoompan=z='min(1.0+0.5*on/${totalFrames},1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    }
  }

  /**
   * Stitch multiple rendered scene clips into a single video file.
   */
  private concatenateClips(clipPaths: string[], outputPath: string, tempDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const listPath = path.join(tempDir, 'concat_list.txt');
      const listContent = clipPaths.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n');
      fs.writeFileSync(listPath, listContent);

      ffmpeg()
        .input(listPath)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c copy'])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`[RenderEngine] Concatenation failed: ${err.message}`)))
        .run();
    });
  }

  /**
   * Mix video narration with background music using sidechain audio ducking.
   */
  private mixAudioTracks(opts: {
    videoInputPath: string;
    outputPath: string;
    backgroundMusicUrl?: string;
    backgroundMusicVolume: number;
    enableAudioDucking: boolean;
    totalDuration: number;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!opts.backgroundMusicUrl || !fs.existsSync(opts.backgroundMusicUrl)) {
        // No background music — skip audio mixing pass
        return resolve();
      }

      const cmd = ffmpeg();
      cmd.input(opts.videoInputPath);
      cmd.input(opts.backgroundMusicUrl).inputOptions(['-stream_loop -1']);

      if (opts.enableAudioDucking) {
        // Complex filter for sidechain audio ducking (lowers music when voice speaks)
        cmd.complexFilter([
          `[1:a]volume=${opts.backgroundMusicVolume}[music]`,
          `[0:a][music]sidechaincompress=threshold=0.05:ratio=4:attack=100:release=300[mixed_audio]`,
        ]);
        cmd.outputOptions(['-map 0:v', '-map [mixed_audio]']);
      } else {
        // Simple linear mixing
        cmd.complexFilter([
          `[1:a]volume=${opts.backgroundMusicVolume}[music]`,
          `[0:a][music]amix=inputs=2:duration=first:dropout_transition=2[mixed_audio]`,
        ]);
        cmd.outputOptions(['-map 0:v', '-map [mixed_audio]']);
      }

      cmd
        .outputOptions(['-c:v copy', '-c:a aac', '-shortest'])
        .output(opts.outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`[RenderEngine] Audio mixing failed: ${err.message}`)))
        .run();
    });
  }

  /**
   * Apply final pass (subtitles, watermark, final container encoding).
   */
  private applyFinalPass(opts: {
    inputPath: string;
    outputPath: string;
    subtitlesSrtPath?: string;
    watermarkText?: string;
    profile: ReturnType<typeof FFmpegService.getProfile>;
    onProgress: (percent: number) => void;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = ffmpeg().input(opts.inputPath);
      const filters: string[] = [];

      if (opts.subtitlesSrtPath && fs.existsSync(opts.subtitlesSrtPath)) {
        const srtEscaped = opts.subtitlesSrtPath.replace(/\\/g, '/').replace(/:/g, '\\:');
        filters.push(`subtitles='${srtEscaped}':force_style='FontName=Inter,FontSize=20,PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000,BorderStyle=1,Outline=2,Shadow=1,MarginV=30'`);
      }

      if (opts.watermarkText) {
        filters.push(`drawtext=text='${opts.watermarkText}':x=w-tw-20:y=20:fontsize=16:fontcolor=white@0.6:shadowcolor=black@0.4:shadowx=1:shadowy=1`);
      }

      if (filters.length > 0) {
        cmd.videoFilters(filters);
      }

      cmd
        .outputOptions([
          '-c:v libx264',
          '-preset fast',
          `-b:v ${opts.profile.bitrate}`,
          '-c:a copy',
          '-movflags +faststart', // Enable web streaming optimization
        ])
        .output(opts.outputPath)
        .on('progress', (p) => {
          if (p.percent) opts.onProgress(Math.round(p.percent));
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`[RenderEngine] Final pass failed: ${err.message}`)))
        .run();
    });
  }

  /**
   * Helper to generate a dark gradient solid background image for scenes without images.
   */
  private createFallbackColorImage(width: number, height: number, tempDir: string, sceneNum: number): string {
    const fallbackPath = path.join(tempDir, `fallback_${sceneNum}.png`);
    // Create a 1x1 black pixel or static buffer image if not existent
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(fallbackPath, pngBuffer);
    return fallbackPath;
  }

  private cleanDirectory(dirPath: string): void {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    } catch (err) {
      logger.warn(`[RenderEngine] Failed to clean temp dir ${dirPath}:`, (err as Error).message);
    }
  }
}

export const renderEngine = new RenderEngine();
