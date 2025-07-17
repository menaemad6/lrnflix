
import React, { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, Play } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';


// Watermark animation speed (higher is slower, lower is faster)
const WATERMARK_SPEED = 999; // higher = slower, lower = faster
const WATERMARK_BASE_SPEED = 100; // adjust this for overall movement scale
// Watermark font weight (e.g., 'bold', 'normal', '600', etc.)
const WATERMARK_FONT_WEIGHT = '300';
// Watermark font size in px (e.g., 22)
const WATERMARK_FONT_SIZE = 24;
// Watermark opacity (0 to 1)
const WATERMARK_OPACITY = 0.01;


interface SecureVideoPlayerProps {
  lessonId: string;
  className?: string;
}

interface CustomPauseOverlayProps {
  videoId: string;
  onPlay: () => void;
  show: boolean;
}

const CustomPauseOverlay: React.FC<CustomPauseOverlayProps> = ({ videoId, onPlay, show }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ background: 'transparent' }}>
      {/* Video Thumbnail - removed as per bugfix */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Custom Play Button */}
        <button
          onClick={onPlay}
          className="relative z-10 w-20 h-20 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl border-4 border-white/20"
          style={{
            background: 'hsl(var(--primary))',
          }}
        >
          <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
        </button>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 pointer-events-none" />
      </div>
    </div>
  );
};

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({ lessonId, className = '' }) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const plyrInstance = useRef<Plyr | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string>('');
  const [isPaused, setIsPaused] = useState(true);
  const [showCustomOverlay, setShowCustomOverlay] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const watermarkWebGLRef = useRef<HTMLCanvasElement>(null);
  const [playerContainer, setPlayerContainer] = useState<HTMLElement | null>(null);

  // Track the actual player container (Plyr or fallback)
  useEffect(() => {
    let container: HTMLElement | null = playerRef.current;
    if (plyrInstance.current && plyrInstance.current.elements && plyrInstance.current.elements.container) {
      container = plyrInstance.current.elements.container;
    }
    setPlayerContainer(container);
  }, [videoId, loading]);

  // Animate watermark using WebGL (only when container is available)
  useEffect(() => {
    if (!user?.id || !playerContainer) return;
    const canvas = watermarkWebGLRef.current || document.createElement('canvas');
    watermarkWebGLRef.current = canvas;
    // Remove from any previous parent
    if (canvas.parentElement && canvas.parentElement !== playerContainer) {
      canvas.parentElement.removeChild(canvas);
    }
    // Append to the correct container
    if (canvas.parentElement !== playerContainer) {
      playerContainer.appendChild(canvas);
    }
    const gl = canvas.getContext('webgl', { alpha: true });
    if (!gl) return;
    let t = 0;
    let animationFrameId: number;

    function resizeCanvas() {
      const rect = playerContainer.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }
    function ensureCanvasOnTop() {
      if (canvas.parentElement !== playerContainer) {
        playerContainer.appendChild(canvas);
      } else if (playerContainer.lastChild !== canvas) {
        playerContainer.appendChild(canvas);
      }
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = playerContainer.offsetWidth + 'px';
      canvas.style.height = playerContainer.offsetHeight + 'px';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9999';
      canvas.style.display = 'block';
    }
    function handleResize() {
      resizeCanvas();
      ensureCanvasOnTop();
    }
    document.addEventListener('fullscreenchange', handleResize);
    window.addEventListener('resize', handleResize);

    function createTextTexture(text: string, fontWeight = WATERMARK_FONT_WEIGHT, fontSize = WATERMARK_FONT_SIZE, color = `rgba(255,255,255,${WATERMARK_OPACITY})`) {
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 512;
      textCanvas.height = 64;
      const ctx = textCanvas.getContext('2d');
      if (!ctx) return null;
      ctx.font = `${fontWeight} ${fontSize}px monospace`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 2;
      ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      ctx.fillText(text, textCanvas.width / 2, textCanvas.height / 2);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return { texture, width: textCanvas.width, height: textCanvas.height };
    }
    const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;
      void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_texCoord = a_texCoord;
      }
    `;
    const fsSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      void main() {
        gl_FragColor = texture2D(u_image, v_texCoord);
      }
    `;
    function createShader(type: number, source: string) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }
    function createProgram(vs: WebGLShader, fs: WebGLShader) {
      const program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      return program;
    }
    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    const program = createProgram(vertexShader, fragmentShader);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const imageLocation = gl.getUniformLocation(program, 'u_image');
    const positionBuffer = gl.createBuffer();
    const texCoordBuffer = gl.createBuffer();
    const watermarkText = user.id.slice(0, 8);
    const textTex = createTextTexture(watermarkText, WATERMARK_FONT_WEIGHT, WATERMARK_FONT_SIZE, `rgba(255,255,255,${WATERMARK_OPACITY})`);
    if (!textTex) return;
    // --- Random walk state ---
    const randState = { x: undefined as number | undefined, y: undefined as number | undefined, vx: undefined as number | undefined, vy: undefined as number | undefined };
    function draw() {
      resizeCanvas();
      ensureCanvasOnTop();
      const width = canvas.width;
      const height = canvas.height;
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, width, height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textTex.texture);
      gl.uniform1i(imageLocation, 0);

      // --- Random walk movement ---
      if (randState.x === undefined || randState.y === undefined || randState.vx === undefined || randState.vy === undefined) {
        randState.x = width / 2;
        randState.y = height / 2;
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.max(0.2, WATERMARK_BASE_SPEED / WATERMARK_SPEED); // higher speed = slower movement
        randState.vx = Math.cos(angle) * speed;
        randState.vy = Math.sin(angle) * speed;
      }
      if (t % Math.max(1, Math.floor(WATERMARK_SPEED / 10)) === 0) {
        randState.vx += (Math.random() - 0.5) * 0.5;
        randState.vy += (Math.random() - 0.5) * 0.5;
        const maxSpeed = Math.max(0.2, WATERMARK_BASE_SPEED / WATERMARK_SPEED);
        const mag = Math.sqrt(randState.vx * randState.vx + randState.vy * randState.vy);
        if (mag > maxSpeed) {
          randState.vx = (randState.vx / mag) * maxSpeed;
          randState.vy = (randState.vy / mag) * maxSpeed;
        }
      }
      randState.x += randState.vx;
      randState.y += randState.vy;
      const w = textTex.width;
      const h = textTex.height;
      if (randState.x < w / 2) { randState.x = w / 2; randState.vx = Math.abs(randState.vx); }
      if (randState.x > width - w / 2) { randState.x = width - w / 2; randState.vx = -Math.abs(randState.vx); }
      if (randState.y < h / 2) { randState.y = h / 2; randState.vy = Math.abs(randState.vy); }
      if (randState.y > height - h / 2) { randState.y = height - h / 2; randState.vy = -Math.abs(randState.vy); }
      const x = randState.x;
      const y = randState.y;
      const x0 = x - w / 2;
      const y0 = y - h / 2;
      const x1 = x + w / 2;
      const y1 = y + h / 2;

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x0, y0,
        x1, y0,
        x0, y1,
        x0, y1,
        x1, y0,
        x1, y1,
      ]), gl.STREAM_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,
      ]), gl.STREAM_DRAW);
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      t += 1;
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteTexture(textTex.texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texCoordBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      document.removeEventListener('fullscreenchange', handleResize);
      window.removeEventListener('resize', handleResize);
      if (canvas.parentElement === playerContainer) {
        playerContainer.removeChild(canvas);
      }
    };
  }, [user?.id, playerContainer]);

  useEffect(() => {
    let mounted = true;

    const initializePlayer = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('User not authenticated');
        }

        console.log('Fetching video ID for lesson:', lessonId);

        // Call edge function to get video ID
        const { data, error: functionError } = await supabase.functions.invoke('get-video-id', {
          body: { lessonId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (functionError) {
          console.error('Function error:', functionError);
          throw new Error(functionError.message || 'Failed to load video');
        }

        if (!data?.videoId) {
          throw new Error('No video ID received');
        }

        console.log('Received video ID, initializing player');
        setVideoId(data.videoId);

        if (!mounted) return;

        // Initialize Plyr with YouTube
        if (playerRef.current) {
          // Create YouTube iframe
          const iframe = document.createElement('div');
          iframe.setAttribute('data-plyr-provider', 'youtube');
          iframe.setAttribute('data-plyr-embed-id', data.videoId);
          
          playerRef.current.innerHTML = '';
          playerRef.current.appendChild(iframe);

          // Initialize Plyr with enhanced security settings
          plyrInstance.current = new Plyr(iframe, {
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
            youtube: {
              noCookie: true,
              rel: 0,
              showinfo: 0,
              modestbranding: 1,
              controls: 0,
              fs: 0,
              disablekb: 1,
              iv_load_policy: 3, // Hide annotations
              cc_load_policy: 0, // Hide captions by default
              playsinline: 1,
            },
            ratio: '16:9',
            fullscreen: { enabled: true, fallback: true, iosNative: true },
            keyboard: { focused: false, global: false },
          });

          // Enhanced protection
          const playerContainer = plyrInstance.current.elements.container;
          if (playerContainer) {
            // Disable right-click
            playerContainer.addEventListener('contextmenu', (e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            });

            // Disable text selection
            playerContainer.addEventListener('selectstart', (e) => {
              e.preventDefault();
              return false;
            });

            // Disable drag
            playerContainer.addEventListener('dragstart', (e) => {
              e.preventDefault();
              return false;
            });

            // Hide YouTube branding with CSS injection
            const style = document.createElement('style');
            style.textContent = `
              .plyr--youtube .plyr__video-wrapper iframe {
                pointer-events: none !important;
              }
              .plyr--youtube .ytp-chrome-top,
              .plyr--youtube .ytp-show-cards-title,
              .plyr--youtube .ytp-title-channel,
              .plyr--youtube .ytp-title-text,
              .plyr--youtube .ytp-watermark,
              .plyr--youtube .ytp-gradient-top,
              .plyr--youtube .ytp-chrome-top-buttons,
              .plyr--youtube .ytp-title,
              .plyr--youtube .ytp-copylink-button,
              .plyr--youtube .ytp-watch-later-button {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
              }
              .plyr--youtube .plyr__poster {
                background-color: hsl(var(--background)) !important;
              }
              .plyr__controls {
                background: linear-gradient(to top, hsl(var(--background)/0.8), transparent) !important;
                color: hsl(var(--foreground)) !important;
              }
              .plyr__control--overlaid {
                background: hsl(var(--primary)) !important;
                color: hsl(var(--primary-foreground)) !important;
              }
              .plyr__progress__played {
                background-color: hsl(var(--primary)) !important;
              }
              .plyr__volume--display {
                color: hsl(var(--foreground)) !important;
              }
            `;
            document.head.appendChild(style);
          }

          // Event listeners for custom overlay
          plyrInstance.current.on('ready', () => {
            if (mounted) {
              console.log('Player ready');
              setLoading(false);
              setIsPaused(true);
              setShowCustomOverlay(true);
            }
          });

          plyrInstance.current.on('play', () => {
            if (mounted) {
              setIsPaused(false);
              setShowCustomOverlay(false);
            }
          });

          plyrInstance.current.on('pause', () => {
            if (mounted) {
              setIsPaused(true);
              setShowCustomOverlay(true);
            }
          });

          plyrInstance.current.on('ended', () => {
            if (mounted) {
              setIsPaused(true);
              setShowCustomOverlay(true);
            }
          });

          plyrInstance.current.on('error', () => {
            if (mounted) {
              setError('Failed to load video');
              setLoading(false);
            }
          });
        }

      } catch (err: unknown) {
        console.error('Error initializing video player:', err);
        if (mounted) {
          let message = 'Failed to load video';
          if (typeof err === 'string') {
            message = err;
          } else if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
            message = (err as { message: string }).message;
          }
          setError(message);
          setLoading(false);
        }
      }
    };

    initializePlayer();

    return () => {
      mounted = false;
      if (plyrInstance.current) {
        plyrInstance.current.destroy();
        plyrInstance.current = null;
      }
    };
  }, [lessonId]);

  useEffect(() => {
    // Inject emerald color for the played portion of the progress bar (cross-browser)
    const emeraldStyle = document.createElement('style');
    emeraldStyle.textContent = `
      /* Played portion for Plyr progress bar */
      .plyr__progress__played {
        background: #10b981 !important;
      }
      /* Webkit browsers - progress bar */
      .plyr__progress input[type='range']::-webkit-slider-thumb {
        border-color: #10b981 !important;
      }
      .plyr__progress input[type='range']::-webkit-slider-runnable-track {
        background: linear-gradient(to right, #10b981 var(--value, 0%), transparent 0%) !important;
      }
      /* Firefox - progress bar */
      .plyr__progress input[type='range']::-moz-range-progress {
        background-color: #10b981 !important;
      }
      .plyr__progress input[type='range']::-moz-range-thumb {
        border-color: #10b981 !important;
      }
      /* IE - progress bar */
      .plyr__progress input[type='range']::-ms-fill-lower {
        background-color: #10b981 !important;
      }
      .plyr__progress input[type='range']::-ms-thumb {
        border-color: #10b981 !important;
      }
      /* Played portion for Plyr volume bar */
      .plyr__volume--display {
        color: #10b981 !important;
      }
      /* Webkit browsers - volume bar */
      .plyr__volume input[type='range']::-webkit-slider-thumb {
        background: #10b981 !important;
      }
      .plyr__volume input[type='range']::-webkit-slider-runnable-track {
        background: linear-gradient(to right, #10b981 var(--value, 0%), transparent 0%) !important;
      }
      /* Firefox - volume bar */
      .plyr__volume input[type='range']::-moz-range-progress {
        background-color: #10b981 !important;
      }
      .plyr__volume input[type='range']::-moz-range-thumb {
        background: #10b981 !important;
      }
      /* IE - volume bar */
      .plyr__volume input[type='range']::-ms-fill-lower {
        background-color: #10b981 !important;
      }
      .plyr__volume input[type='range']::-ms-thumb {
        background: #10b981 !important;
      }
    `;
    document.head.appendChild(emeraldStyle);
    return () => {
      document.head.removeChild(emeraldStyle);
    };
  }, []);

  const handleCustomPlay = () => {
    if (plyrInstance.current) {
      plyrInstance.current.play();
      setShowCustomOverlay(false);
      setIsPaused(false);
    }
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 bg-card border rounded-lg ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive font-medium">Error loading video</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card border rounded-lg z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading video...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={playerRef} 
        className="relative bg-black rounded-lg overflow-hidden"
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      />
      
      {/* Custom Pause Overlay */}
      {videoId && (
        <CustomPauseOverlay
          videoId={videoId}
          onPlay={handleCustomPlay}
          show={showCustomOverlay && !loading}
        />
      )}
      
      {/* Enhanced anti-interaction overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          background: 'linear-gradient(45deg, transparent 49%, rgba(0,0,0,0.001) 50%, transparent 51%)'
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
      />
      {/* Watermark WebGL Canvas Overlay */}
      {/* Remove <canvas> from the React tree, it is now managed via DOM APIs */}
    </div>
  );
};
