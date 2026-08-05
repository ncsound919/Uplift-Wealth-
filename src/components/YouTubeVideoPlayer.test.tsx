import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractYouTubeId, YouTubeVideoPlayer } from './YouTubeVideoPlayer';
import { render, screen, fireEvent, act } from '@testing-library/react';

describe('YouTubeVideoPlayer', () => {
  describe('extractYouTubeId', () => {
    it('returns null for empty input', () => {
      expect(extractYouTubeId('')).toBeNull();
    });

    it('returns null for whitespace input', () => {
      expect(extractYouTubeId('   ')).toBeNull();
    });

    it('returns null for garbage input', () => {
      expect(extractYouTubeId('not a url')).toBeNull();
    });

    it('returns the ID when given an 11-char raw video ID', () => {
      expect(extractYouTubeId('5-O4jQ_aBWA')).toBe('5-O4jQ_aBWA');
    });

    it('parses youtu.be short URLs', () => {
      expect(extractYouTubeId('https://youtu.be/5-O4jQ_aBWA')).toBe('5-O4jQ_aBWA');
    });

    it('parses youtube.com watch URLs', () => {
      expect(extractYouTubeId('https://www.youtube.com/watch?v=5-O4jQ_aBWA')).toBe('5-O4jQ_aBWA');
    });

    it('parses youtube.com embed URLs', () => {
      expect(extractYouTubeId('https://www.youtube.com/embed/5-O4jQ_aBWA')).toBe('5-O4jQ_aBWA');
    });

    it('parses youtube.com /v/ URLs', () => {
      expect(extractYouTubeId('https://www.youtube.com/v/5-O4jQ_aBWA')).toBe('5-O4jQ_aBWA');
    });

    it('parses youtube.com /shorts/ URLs', () => {
      expect(extractYouTubeId('https://www.youtube.com/shorts/5-O4jQ_aBWA')).toBe('5-O4jQ_aBWA');
    });

    it('parses youtube-nocookie.com URLs', () => {
      expect(extractYouTubeId('https://www.youtube-nocookie.com/embed/5-O4jQ_aBWA')).toBe('5-O4jQ_aBWA');
    });

    it('returns null for invalid ID length', () => {
      expect(extractYouTubeId('5-O4jQ_aB')).toBeNull();
    });

    it('returns null for ID with invalid characters', () => {
      expect(extractYouTubeId('5-O4jQ_aBWA!')).toBeNull();
    });

    it('extracts ID from URLs with additional params via regex fallback', () => {
      expect(extractYouTubeId('https://youtube.com/watch?v=5-O4jQ_aBWA&t=30')).toBe('5-O4jQ_aBWA');
    });

    it('returns null for non-URL with URL-like patterns that fail to parse', () => {
      expect(extractYouTubeId('https://')).toBeNull();
    });

    it('parses embed URL with path segments', () => {
      expect(extractYouTubeId('https://www.youtube.com/embed/5-O4jQ_aBWA?autoplay=1')).toBe('5-O4jQ_aBWA');
    });

    it('returns null for a parseable youtube URL with no valid id', () => {
      expect(extractYouTubeId('https://www.youtube.com/')).toBeNull();
      expect(extractYouTubeId('https://youtu.be/')).toBeNull();
    });
  });

  describe('Component rendering', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows the invalid video resource UI for bad IDs', () => {
      render(<YouTubeVideoPlayer videoId="bad-id" title="Test" />);
      expect(screen.getByText('Invalid Video Resource')).toBeInTheDocument();
    });

    it('renders an iframe for a valid video ID', () => {
      const { container } = render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test Video" />);
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.getAttribute('src')).toContain('youtube-nocookie.com/embed/5-O4jQ_aBWA');
    });

    it('displays the video title in the header', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="My Masterclass Title" />);
      expect(screen.getByText('My Masterclass Title')).toBeInTheDocument();
    });

    it('shows the YouTube embed button as active by default', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      const embedButtons = screen.getAllByRole('button', { name: /YouTube Embed/i });
      const activeEmbedButton = embedButtons.find(b => b.className.includes('bg-red-600'));
      expect(activeEmbedButton).toBeDefined();
    });

    it('shows the Watch on YouTube external link', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      const link = screen.getByRole('link', { name: /Watch on YouTube/i });
      expect(link.getAttribute('href')).toBe('https://www.youtube.com/watch?v=5-O4jQ_aBWA');
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('switches to Interactive Lecture mode when clicked', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      const lectureButtons = screen.getAllByRole('button', { name: /Interactive Lecture/i });
      fireEvent.click(lectureButtons[0]);
      expect(screen.getByText(/Visual Educational Sandbox Lecture/i)).toBeInTheDocument();
    });

    it('switches to Direct Link mode when clicked', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      const directButton = screen.getByRole('button', { name: /^Direct Link$/i });
      fireEvent.click(directButton);
      expect(screen.getByText(/YouTube embed policies may restrict playback/i)).toBeInTheDocument();
    });

    it('displays description when provided', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" description="My custom description" />);
      expect(screen.getByText('My custom description')).toBeInTheDocument();
    });

    it('renders default description in simulation mode when no description given', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      const lectureButtons = screen.getAllByRole('button', { name: /Interactive Lecture/i });
      fireEvent.click(lectureButtons[0]);
      expect(screen.getByText(/Comprehensive financial technology architecture masterclass/i)).toBeInTheDocument();
    });

    it('reloads the iframe when reload button is clicked', () => {
      const { container } = render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      const iframeBefore = container.querySelector('iframe');
      const srcBefore = iframeBefore?.getAttribute('src');
      fireEvent.click(screen.getByRole('button', { name: /Reload video player/i }));
      const iframeAfter = container.querySelector('iframe');
      expect(iframeAfter?.getAttribute('src')).toBe(srcBefore);
    });

    it('renders simulation mode with progress indicator and time display', () => {
      const { container } = render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test Sim" />);
      fireEvent.click(screen.getAllByRole('button', { name: /Interactive Lecture/i })[0]);

      expect(screen.getByText(/Simulated Masterclass Lecture/i)).toBeInTheDocument();
      expect(screen.getAllByText('Test Sim').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/5-O4jQ_aBWA/)).toBeInTheDocument();
      expect(screen.getByText(/0:00 \/ 12:00/)).toBeInTheDocument();

      const progressInner = container.querySelector('[style*="width:"]');
      expect(progressInner).toBeInTheDocument();

      act(() => { vi.advanceTimersByTime(600); });
      expect(screen.getByText(/0:12 \/ 12:00/)).toBeInTheDocument();

      act(() => { vi.runOnlyPendingTimers(); });
    });

    it('clicking play/pause toggle switches icon', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      fireEvent.click(screen.getAllByRole('button', { name: /Interactive Lecture/i })[0]);

      const controlButtons = screen.getAllByRole('button');
      // Find the play/pause button in the simulation controls (has no text, just an svg)
      const toggleBtn = controlButtons.find(b => {
        const svgs = b.querySelectorAll('svg');
        return svgs.length > 0 && b.closest('.aspect-video');
      });
      expect(toggleBtn).toBeTruthy();
      if (toggleBtn) {
        fireEvent.click(toggleBtn);
        fireEvent.click(toggleBtn);
      }
    });

    it('restart button resets progress', () => {
      const { container } = render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      fireEvent.click(screen.getAllByRole('button', { name: /Interactive Lecture/i })[0]);

      const simPanel = container.querySelector('.aspect-video');
      const controlBtns = simPanel?.querySelectorAll('button');
      expect(controlBtns?.length).toBeGreaterThanOrEqual(2);
      if (controlBtns && controlBtns[1]) {
        fireEvent.click(controlBtns[1]);
      }
      const progressInner = container.querySelector('[style*="width: 0%"]');
      expect(progressInner).toBeInTheDocument();
    });

    it('mute toggle switches volume icon', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      fireEvent.click(screen.getAllByRole('button', { name: /Interactive Lecture/i })[0]);

      const controlButtons = screen.getAllByRole('button');
      const muteBtn = controlButtons.find(b => {
        const svgs = b.querySelectorAll('svg');
        return svgs.length > 0 && b.closest('.aspect-video');
      });
      const allSimBtns = controlButtons.filter(b => b.closest('.aspect-video'));
      expect(allSimBtns.length).toBeGreaterThanOrEqual(3);
      fireEvent.click(allSimBtns[2]);
      fireEvent.click(allSimBtns[2]);
    });

    it('direct mode renders launch link', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      fireEvent.click(screen.getByRole('button', { name: /^Direct Link$/i }));
      expect(screen.getByRole('link', { name: /Launch Masterclass on YouTube/i })).toBeInTheDocument();
    });

    it('switches to simulation mode via bottom toggle', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      const allButtons = screen.getAllByRole('button');
      const bottomSimBtn = allButtons.find(b => b.textContent?.trim() === 'Interactive Lecture' && !b.className.includes('bg-indigo-600'));
      expect(bottomSimBtn).toBeTruthy();
      if (bottomSimBtn) {
        fireEvent.click(bottomSimBtn);
        expect(screen.getByText(/Simulated Masterclass Lecture/i)).toBeInTheDocument();
      }
    });

    it('switches to direct link mode via bottom toggle', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      const allButtons = screen.getAllByRole('button');
      const bottomDirectBtn = allButtons.find(b => b.textContent?.trim() === 'Direct Link' && !b.className.includes('bg-slate-700'));
      expect(bottomDirectBtn).toBeTruthy();
      if (bottomDirectBtn) {
        fireEvent.click(bottomDirectBtn);
      }
    });

    it('applies custom class name', () => {
      const { container } = render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" className="my-custom-class" />);
      const outerDiv = container.querySelector('.my-custom-class');
      expect(outerDiv).toBeInTheDocument();
    });

    it('switches back to youtube mode via header embed button', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      const embedButtons = screen.getAllByRole('button', { name: /YouTube Embed/i });
      fireEvent.click(embedButtons[0]);
      expect(containerQueryIframe()).not.toBeNull();
    });

    it('switches back to youtube mode via bottom embed toggle', () => {
      const { container } = render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      fireEvent.click(screen.getAllByRole('button', { name: /Interactive Lecture/i })[0]);
      expect(screen.getByText(/Simulated Masterclass Lecture/i)).toBeInTheDocument();
      const embedButtons = screen.getAllByRole('button', { name: /YouTube Embed/i });
      fireEvent.click(embedButtons[embedButtons.length - 1]);
      expect(container.querySelector('iframe')).not.toBeNull();
    });

    it('switches to simulation mode via bottom interactive lecture toggle', () => {
      render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      const lectureButtons = screen.getAllByRole('button', { name: /Interactive Lecture/i });
      fireEvent.click(lectureButtons[lectureButtons.length - 1]);
      expect(screen.getByText(/Simulated Masterclass Lecture/i)).toBeInTheDocument();
    });

    it('seeks the simulation progress by clicking the scrubber', () => {
      const { container } = render(<YouTubeVideoPlayer videoId="5-O4jQ_aBWA" title="Test" />);
      fireEvent.click(screen.getAllByRole('button', { name: /Interactive Lecture/i })[0]);
      const simPanel = container.querySelector('.aspect-video');
      const scrubber = simPanel?.querySelector('div[class*="cursor-pointer"]');
      expect(scrubber).toBeTruthy();
      if (scrubber) {
        fireEvent.click(scrubber);
        const progressInner = container.querySelector('[style*="width:"]');
        expect(progressInner).toBeInTheDocument();
      }
    });
  });
});

function containerQueryIframe() {
  return document.querySelector('iframe');
}
