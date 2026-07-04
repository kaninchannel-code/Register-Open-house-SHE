import { useEffect, useRef, useState } from 'react';

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // States for interactive holographic panels
  const [chartData, setChartData] = useState<number[]>([30, 45, 35, 50, 40, 60, 45, 55, 40, 50]);
  const [logs, setLogs] = useState<string[]>([]);

  // Initialize logs on client side
  useEffect(() => {
    setLogs([
      `[${new Date().toLocaleTimeString('th-TH')}] SMPC CORE ACTIVE`,
      `[${new Date().toLocaleTimeString('th-TH')}] ESTABLISHED SECURE TUNNEL`,
      `[${new Date().toLocaleTimeString('th-TH')}] SHEE_AGENT_NODE REGISTERED`,
      `[${new Date().toLocaleTimeString('th-TH')}] SECURITY GATE: ONLINE`
    ]);
  }, []);

  // Update dynamic telemetry and diagnostic chart
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const next = [...prev.slice(1), Math.floor(Math.random() * 45) + 20];
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Update dynamic console logs
  useEffect(() => {
    const logTemplates = [
      'ROUTER_OK: PING_ACK',
      'PORT_3000: INGRESS_ACTIVE',
      'SHEE_LINK: HEARTBEAT_STABLE',
      'TEMP_OK: CORE_NODE (38.4°C)',
      'MEMORY: ALLOC_NORMAL',
      'SMPC_API: SECURE_HANDSHAKE',
      'FIREWALL: SHIELD_REINFORCED',
      'SMPC_GATE: STATUS_MONITOR_OK',
      'AGENT_COMM: SYNC_COMPLETED'
    ];
    
    const interval = setInterval(() => {
      setLogs(prev => {
        if (prev.length === 0) return prev;
        const nextLog = logTemplates[Math.floor(Math.random() * logTemplates.length)];
        return [...prev.slice(1), `[${new Date().toLocaleTimeString('th-TH')}] ${nextLog}`];
      });
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  // Canvas-based matrix falling code & background plexus lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class for the cyberpunk matrix plexus
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Slow espionage ambient movement
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.radius = Math.random() * 1.5 + 1;
        this.alpha = Math.random() * 0.4 + 0.15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // Emerald / Neon Green glow
        c.fillStyle = `rgba(16, 185, 129, ${this.alpha})`;
        c.fill();
      }
    }

    // Binary code stream class for falling code
    class BinaryStream {
      x: number;
      y: number;
      speed: number;
      chars: string[];
      opacity: number;

      constructor(x: number) {
        this.x = x;
        this.y = Math.random() * -height;
        this.speed = Math.random() * 1.2 + 0.4;
        this.chars = [];
        this.opacity = Math.random() * 0.3 + 0.08;
        this.generateChars();
      }

      generateChars() {
        const length = Math.floor(Math.random() * 8) + 4;
        for (let i = 0; i < length; i++) {
          this.chars.push(Math.random() > 0.5 ? '1' : '0');
        }
      }

      update() {
        this.y += this.speed;
        if (this.y > height) {
          this.y = -100;
          this.speed = Math.random() * 1.2 + 0.4;
          this.opacity = Math.random() * 0.3 + 0.08;
        }
        if (Math.random() < 0.05) {
          this.chars.shift();
          this.chars.push(Math.random() > 0.5 ? '1' : '0');
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.font = '8px monospace';
        c.fillStyle = `rgba(16, 185, 129, ${this.opacity})`;
        for (let i = 0; i < this.chars.length; i++) {
          c.fillText(this.chars[i], this.x, this.y - i * 11);
        }
      }
    }

    // Initialize elements
    const particles: Particle[] = [];
    const particleCount = Math.min(50, Math.floor((width * height) / 30000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const streams: BinaryStream[] = [];
    const streamCount = Math.min(30, Math.floor(width / 50));
    for (let i = 0; i < streamCount; i++) {
      streams.push(new BinaryStream(i * (width / streamCount)));
    }

    // Handle resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)'; // Slate-950 trail for visual flow
      ctx.fillRect(0, 0, width, height);

      // 1. Draw grid backdrop lines (highly technical)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.012)';
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Update and Draw Binary Streams
      streams.forEach((stream) => {
        stream.update();
        stream.draw(ctx);
      });

      // 3. Update and Draw Particles
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      // 4. Draw Plexus Lines (connect particles close to each other)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.1;
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 5. Ambient HUD scan lines
      ctx.fillStyle = 'rgba(16, 185, 129, 0.003)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Compute points for dynamic diagnostic graph path
  const linePathD = chartData
    .map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${idx * 22} ${80 - val}`)
    .join(' ');

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
      
      {/* 1. Underlying dynamic particle & binary canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover opacity-85"
      />

      {/* 2. Deep radial vignette gradient to match the dark mysterious command center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,6,23,0.92)_100%)]" />

      {/* 3. Dark Industrial Columns and structural frames (SVG + CSS) */}
      <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent border-r border-slate-900/20 opacity-45 hidden md:block">
        {/* Truss girders lines */}
        <div className="w-full h-full bg-[linear-gradient(45deg,#1e293b_1px,transparent_1px),linear-gradient(-45deg,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20" />
      </div>
      <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-slate-950/90 via-slate-900/60 to-transparent border-l border-slate-900/20 opacity-45 hidden md:block">
        <div className="w-full h-full bg-[linear-gradient(45deg,#1e293b_1px,transparent_1px),linear-gradient(-45deg,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20" />
      </div>

      {/* Industrial piping overlay on the edges (replicating pipeline structure) */}
      <div className="absolute top-0 bottom-0 left-8 w-2 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 border-x border-slate-950 opacity-15 hidden lg:block" />
      <div className="absolute top-0 bottom-0 right-8 w-3 bg-gradient-to-r from-slate-850 via-slate-750 to-slate-900 border-x border-slate-950 opacity-15 hidden lg:block" />

      {/* 4. Downward Projecting Cyber Laser Light Beam */}
      <div className="absolute top-[20%] bottom-0 left-1/2 -translate-x-1/2 w-[600px] pointer-events-none opacity-20 md:opacity-30 mix-blend-screen select-none -z-15">
        <svg viewBox="0 0 500 1000" className="w-full h-full">
          <defs>
            <linearGradient id="laser-beam" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#22d3ee" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points="250,50 50,1000 450,1000" fill="url(#laser-beam)" />
          {/* Faint laser guide lines */}
          <line x1="250" y1="50" x2="50" y2="1000" stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.4" />
          <line x1="250" y1="50" x2="450" y2="1000" stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.4" />
        </svg>
      </div>

      {/* 5. Majestic Glowing Neon SMPC Diamond Logo (Exactly from the attachment) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] pointer-events-none opacity-[0.25] md:opacity-[0.35] lg:opacity-[0.45] select-none -z-10 scale-75 sm:scale-85 md:scale-95 lg:scale-110 xl:scale-120 transition-all duration-700">
        <svg width="550" height="550" viewBox="0 0 500 500" className="drop-shadow-[0_0_35px_rgba(34,211,238,0.7)]">
          <defs>
            {/* Real intense neon double-glow filter */}
            <filter id="neon-glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur3" />
              <feMerge>
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="neon-glow-green" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Concentric Double-Diamond Outer Border frame */}
          {/* Thin outer boundary */}
          <polygon 
            points="250,15 485,250 250,485 15,250" 
            fill="none" 
            stroke="#22d3ee" 
            strokeWidth="1.5" 
            opacity="0.3" 
          />
          {/* Thick main neon pipe diamond */}
          <polygon 
            points="250,30 470,250 250,470 30,250" 
            fill="none" 
            stroke="#22d3ee" 
            strokeWidth="5" 
            filter="url(#neon-glow-cyan)" 
            className="animate-[pulse_4s_ease-in-out_infinite]"
          />
          {/* Thin inner pipeline */}
          <polygon 
            points="250,45 455,250 250,455 45,250" 
            fill="none" 
            stroke="#22d3ee" 
            strokeWidth="1.8" 
            opacity="0.7" 
            filter="url(#neon-glow-cyan)"
          />
          <polygon 
            points="250,55 445,250 250,445 55,250" 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="1" 
            opacity="0.4" 
            filter="url(#neon-glow-green)"
          />

          {/* Geometric Inner Lines holding the SMPC text structure */}
          <line x1="90" y1="250" x2="410" y2="250" stroke="#22d3ee" strokeWidth="2.5" opacity="0.45" filter="url(#neon-glow-cyan)" />
          <line x1="165" y1="180" x2="335" y2="180" stroke="#22d3ee" strokeWidth="1.5" opacity="0.3" />
          <line x1="165" y1="320" x2="335" y2="320" stroke="#22d3ee" strokeWidth="1.5" opacity="0.3" />

          {/* Highly stylized, blocky "SMPC" letters (Exactly resembling the logo) */}
          <g transform="translate(0, -5)">
            {/* S */}
            <path 
              d="M 160 215 L 125 215 L 125 242 L 160 248 L 160 275 L 125 275" 
              fill="none" 
              stroke="#22d3ee" 
              strokeWidth="9.5" 
              strokeLinecap="square" 
              strokeLinejoin="miter"
              filter="url(#neon-glow-cyan)" 
            />
            
            {/* M */}
            <path 
              d="M 174 275 L 174 215 L 205 248 L 236 215 L 236 275" 
              fill="none" 
              stroke="#22d3ee" 
              strokeWidth="9.5" 
              strokeLinecap="square" 
              strokeLinejoin="miter"
              filter="url(#neon-glow-cyan)" 
            />

            {/* P */}
            <path 
              d="M 250 275 L 250 215 L 288 215 L 288 248 L 250 248" 
              fill="none" 
              stroke="#22d3ee" 
              strokeWidth="9.5" 
              strokeLinecap="square" 
              strokeLinejoin="miter"
              filter="url(#neon-glow-cyan)" 
            />

            {/* C */}
            <path 
              d="M 338 215 L 303 215 L 303 275 L 338 275" 
              fill="none" 
              stroke="#22d3ee" 
              strokeWidth="9.5" 
              strokeLinecap="square" 
              strokeLinejoin="miter"
              filter="url(#neon-glow-cyan)" 
            />

            {/* Central enclosing line structures linking letters */}
            <line x1="125" y1="210" x2="338" y2="210" stroke="#22d3ee" strokeWidth="1.5" opacity="0.25" />
            <line x1="125" y1="280" x2="338" y2="280" stroke="#22d3ee" strokeWidth="1.5" opacity="0.25" />
          </g>

          {/* "Since 1981" Box Frame & Text directly below */}
          <g transform="translate(0, 10)">
            <rect 
              x="200" 
              y="288" 
              width="100" 
              height="22" 
              fill="#020617" 
              stroke="#22d3ee" 
              strokeWidth="2" 
              filter="url(#neon-glow-cyan)"
            />
            <text 
              x="250" 
              y="303" 
              fill="#e2e8f0" 
              fontSize="9" 
              fontWeight="bold" 
              fontFamily="monospace" 
              letterSpacing="1" 
              textAnchor="middle"
            >
              Since 1981
            </text>
          </g>

          {/* Underlay tech decor lines */}
          <circle cx="250" cy="90" r="4" fill="#22d3ee" filter="url(#neon-glow-cyan)" />
          <circle cx="250" cy="410" r="4" fill="#22d3ee" filter="url(#neon-glow-cyan)" />
        </svg>
      </div>

      {/* 6. Left Holographic Diagnostic Screen (Robotic blueprint / arm) */}
      <div className="absolute left-6 top-1/4 hidden xl:flex flex-col gap-3 w-60 bg-slate-950/65 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 text-emerald-400 font-mono text-xs select-none shadow-[0_0_20px_rgba(16,185,129,0.06)] animate-[pulse_6s_ease-in-out_infinite]">
        <div className="flex items-center justify-between border-b border-emerald-950 pb-2 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold tracking-wider">[ SEC_ARM_SCHEMATIC ]</span>
          </div>
          <span className="text-[9px] text-emerald-600 font-bold">NODE:01</span>
        </div>

        {/* Dynamic Vector schematic SVG representation */}
        <div className="relative h-28 w-full flex items-center justify-center bg-emerald-950/10 border border-emerald-950 rounded-lg overflow-hidden">
          {/* Radar background scanning circle */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.8px,transparent_0.8px)] [background-size:12px_12px] opacity-10" />
          
          <svg viewBox="0 0 100 100" className="w-24 h-24 text-emerald-400/80">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.4" strokeDasharray="5,5" opacity="0.3" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.4" strokeDasharray="5,5" opacity="0.3" />
            
            {/* Mechanical link paths */}
            <g transform="rotate(35 50 50)" className="animate-[spin_12s_linear_infinite]">
              <path d="M 50,50 L 50,22 L 68,22" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M 50,50 L 32,58" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="50" cy="22" r="2.5" fill="currentColor" className="animate-pulse" />
              <circle cx="68" cy="22" r="2" fill="currentColor" />
              <circle cx="50" cy="50" r="3.5" fill="currentColor" />
              <circle cx="32" cy="58" r="2" fill="currentColor" />
            </g>
          </svg>
          <div className="absolute bottom-1 right-2 text-[8px] text-emerald-500/70 font-mono">SYS_MODEL: V3.82</div>
        </div>

        <div className="space-y-1 text-[10px] text-slate-400 font-mono">
          <div className="flex justify-between">
            <span>ARM_REACH:</span>
            <span className="text-emerald-400 font-bold">12,420 mm</span>
          </div>
          <div className="flex justify-between">
            <span>PRESSURE:</span>
            <span className="text-emerald-400 font-bold">184.2 BAR</span>
          </div>
          <div className="flex justify-between">
            <span>OPER_ANGLE:</span>
            <span className="text-emerald-400 font-bold">42.85°</span>
          </div>
          <div className="flex justify-between">
            <span>CALIB_LOAD:</span>
            <span className="text-emerald-400 font-bold">99.2%</span>
          </div>
        </div>
      </div>

      {/* 7. Right Holographic Diagnostic Screen (Dynamic Sensor Graph & Log Console) */}
      <div className="absolute right-6 top-1/4 hidden xl:flex flex-col gap-3 w-60 bg-slate-950/65 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-4 text-emerald-400 font-mono text-xs select-none shadow-[0_0_20px_rgba(16,185,129,0.06)] animate-[pulse_6s_ease-in-out_infinite]">
        <div className="flex items-center justify-between border-b border-emerald-950 pb-2 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold tracking-wider text-cyan-400">[ LIVE_DIAGNOSTICS ]</span>
          </div>
          <span className="text-[9px] text-cyan-600 font-bold">SMPC_NET</span>
        </div>

        {/* Dynamic updating graph */}
        <div className="h-16 w-full bg-slate-950/50 border border-emerald-950 rounded-lg p-1 relative overflow-hidden flex items-end">
          <svg className="w-full h-full text-emerald-400" viewBox="0 0 200 80" preserveAspectRatio="none">
            {/* Grid helper lines */}
            <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" />
            <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" />
            <line x1="0" y1="60" x2="200" y2="60" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" />
            
            <path
              d={linePathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute top-1 left-2 text-[8px] text-emerald-500/60 font-mono">SIGNAL_STRENGTH</div>
        </div>

        {/* Scrolling console logs */}
        <div className="space-y-1 bg-slate-950/80 border border-emerald-950/60 rounded-lg p-2 h-24 overflow-hidden text-[9px] leading-relaxed text-slate-400 font-mono">
          {logs.map((log, index) => (
            <p key={index} className="truncate text-[8.5px] border-b border-slate-900/45 pb-0.5 last:border-0 last:text-emerald-400">
              {log}
            </p>
          ))}
        </div>
      </div>

    </div>
  );
}

