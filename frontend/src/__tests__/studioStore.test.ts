import { describe, it, expect, beforeEach } from 'vitest';
import { useStudioStore } from '../store/studioStore';

describe('StudioStore & NLE Timeline Engine Tests', () => {
  beforeEach(() => {
    useStudioStore.setState({
      tracks: [
        {
          id: 't1',
          name: 'Video Track 1',
          type: 'video',
          isMuted: false,
          isLocked: false,
          isSolo: false,
          color: '#8b5cf6',
          clips: [
            { id: 'c1', name: 'Intro Clip', type: 'video', startTime: 0, duration: 10, mediaUrl: 'http://test.mp4' },
          ],
        },
      ],
      currentTime: 0,
      selectedClipId: null,
      undoStack: [],
      redoStack: [],
    });
  });

  it('should add a new track to the timeline', () => {
    const { addTrack, tracks } = useStudioStore.getState();
    addTrack('audio', 'Voiceover Track');
    expect(useStudioStore.getState().tracks.length).toBe(2);
  });

  it('should split a clip at specified playhead time', () => {
    const { splitClip } = useStudioStore.getState();
    splitClip('c1', 4);

    const track = useStudioStore.getState().tracks[0];
    expect(track.clips.length).toBe(2);
    expect(track.clips[0].duration).toBe(4);
    expect(track.clips[1].duration).toBe(6);
    expect(track.clips[1].startTime).toBe(4);
  });

  it('should delete a clip and update history stack', () => {
    const { deleteClip } = useStudioStore.getState();
    deleteClip('c1');

    const track = useStudioStore.getState().tracks[0];
    expect(track.clips.length).toBe(0);
    expect(useStudioStore.getState().undoStack.length).toBe(1);
  });

  it('should handle undo and redo actions correctly', () => {
    const { deleteClip, undo, redo } = useStudioStore.getState();
    deleteClip('c1');
    expect(useStudioStore.getState().tracks[0].clips.length).toBe(0);

    undo();
    expect(useStudioStore.getState().tracks[0].clips.length).toBe(1);

    redo();
    expect(useStudioStore.getState().tracks[0].clips.length).toBe(0);
  });
});
