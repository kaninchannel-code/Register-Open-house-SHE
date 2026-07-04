import { useState, useEffect, FormEvent } from 'react';
import { 
  User, 
  Lock, 
  Settings, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  X, 
  Eye, 
  EyeOff, 
  UserPlus, 
  ArrowRight, 
  ExternalLink,
  Save,
  HelpCircle,
  ShieldAlert,
  Fingerprint,
  Terminal,
  Activity,
  Cpu,
  Radio,
  Zap,
  LockKeyhole
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CyberBackground from './components/CyberBackground';

// Default configuration values
const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyPmGmpiuI66sKxafcDC2ba-QHI73A87eXtdANwk5oPouT2_Ct1JXUxVGtdUU-6oOKt/exec';
const DEFAULT_TARGET_URL = 'https://www.google.com';

export default function App() {
  // App settings stored in localStorage
  const [scriptUrl, setScriptUrl] = useState(() => {
    return localStorage.getItem('smpc_script_url') || DEFAULT_SCRIPT_URL;
  });
  const [targetUrl, setTargetUrl] = useState(() => {
    return localStorage.getItem('smpc_target_url') || DEFAULT_TARGET_URL;
  });

  // Modal display states
  const [activeModal, setActiveModal] = useState<'login' | 'register' | 'settings' | null>(null);
  
  // Input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Settings input states (temporary buffer before saving)
  const [tempScriptUrl, setTempScriptUrl] = useState(scriptUrl);
  const [tempTargetUrl, setTempTargetUrl] = useState(targetUrl);

  // Interactive fingerprint scanning simulation state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<'success' | 'idle'>('idle');

  // Status / Loading / Toast states
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [alertState, setAlertState] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    onCloseAction?: () => void;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Redirecting state (when login succeeds)
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // System time clock tick for terminal aesthetic
  const [systemTime, setSystemTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toLocaleTimeString('th-TH') + ' ' + now.toLocaleDateString('th-TH'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync settings buffers when modal opens
  useEffect(() => {
    if (activeModal === 'settings') {
      setTempScriptUrl(scriptUrl);
      setTempTargetUrl(targetUrl);
    }
  }, [activeModal, scriptUrl, targetUrl]);

  // Handle countdown timer for redirection
  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      window.location.href = targetUrl;
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown, targetUrl]);

  // Handle Fingerprint Scanner Simulation Progress
  useEffect(() => {
    if (!isScanning) return;
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            setScanResult('success');
            // Open Register or Login depending on context, let's open register modal
            setActiveModal('register');
          }, 600);
          return 100;
        }
        return prev + 8;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isScanning]);

  // Robust Communication Function (Standard Fetch + JSONP Script Tag Fallback)
  const runRequest = async (
    action: 'login' | 'register',
    userVal: string,
    passVal: string,
    callbackName: string
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanedScriptUrl = scriptUrl.trim();
    const url = `${cleanedScriptUrl}?action=${action}&username=${encodeURIComponent(userVal)}&password=${encodeURIComponent(passVal)}&callback=${callbackName}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/javascript, */*',
        }
      });
      
      if (response.ok) {
        const text = await response.text();
        const trimmed = text.trim();
        
        if (trimmed.startsWith(callbackName + '(') && trimmed.endsWith(')')) {
          const jsonStr = trimmed.substring(callbackName.length + 1, trimmed.length - 1);
          return JSON.parse(jsonStr);
        } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
          const jsonStr = trimmed.substring(1, trimmed.length - 1);
          return JSON.parse(jsonStr);
        } else {
          try {
            return JSON.parse(trimmed);
          } catch (e) {
            throw new Error('Not plain JSON response');
          }
        }
      } else {
        throw new Error(`Fetch response status not OK: ${response.status}`);
      }
    } catch (fetchErr) {
      console.warn('Fetch method failed or CORS restricted, falling back to script-tag JSONP:', fetchErr);
      
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const cacheBuster = `&_=${Date.now()}`;
        script.src = url + cacheBuster;
        
        const cleanup = () => {
          if (script.parentNode) {
            document.body.removeChild(script);
          }
          delete (window as any)[callbackName];
        };

        (window as any)[callbackName] = function(data: any) {
          cleanup();
          resolve(data);
        };
        
        script.onerror = () => {
          cleanup();
          reject(new Error('JSONP Script Load Error'));
        };
        
        document.body.appendChild(script);
        
        setTimeout(() => {
          if ((window as any)[callbackName]) {
            cleanup();
            reject(new Error('Connection Timeout'));
          }
        }, 15000);
      });
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showAlert('warning', 'แจ้งเตือนระบบรักษาความปลอดภัย', 'กรุณาระบุชื่อรหัสเจ้าหน้าที่ และรหัสผ่านความปลอดภัยให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setLoadingText('กำลังแลกเปลี่ยนคีย์ความปลอดภัยเข้ารหัสข้อมูล...');

    try {
      const response = await runRequest('login', username, password, 'loginCallback');
      setLoading(false);
      
      if (response.success) {
        setAlertState({
          show: true,
          type: 'success',
          title: 'ยินดีต้อนรับผู้ปฏิบัติงาน!',
          message: 'ยืนยันตัวตนเจ้าหน้าที่ SHEE Agents สำเร็จ กำลังเข้าสู่ระบบควบคุมเซิร์ฟเวอร์หลัก...',
          onCloseAction: () => {
            setRedirectCountdown(3);
          }
        });
      } else {
        showAlert('error', 'การปฏิเสธการเข้าถึง (Access Denied)', response.message || 'รหัสลับเจ้าหน้าที่หรือรหัสผ่านระบบไม่ถูกต้อง โปรดตรวจสอบสิทธิ์ของคุณ');
      }
    } catch (err) {
      setLoading(false);
      showAlert('error', 'สัญญาณขัดข้อง (Network Error)', 'ไม่สามารถถอดรหัสสัญญาณเซิร์ฟเวอร์หลักได้ กรุณาตรวจสอบการตั้งค่า URL หรือการเชื่อมต่อเครือข่าย');
    }
  };

  // Register handler
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showAlert('warning', 'แจ้งเตือนการลงทะเบียน', 'กรุณาระบุรหัสลงชื่อและรหัสผ่านเพื่อใช้สร้างสิทธิ์เข้าถึงพอร์ทัลความปลอดภัย');
      return;
    }

    if (password.length < 4) {
      showAlert('warning', 'ระดับความปลอดภัยต่ำเกินไป', 'รหัสผ่านของคุณสั้นเกินไป กรุณาใช้รหัสผ่านความยาวตั้งแต่ 4 ตัวอักษรขึ้นไปเพื่อป้องการแฮกข้อมูล');
      return;
    }

    setLoading(true);
    setLoadingText('กำลังบันทึกรหัสประจำตัวเจ้าหน้าที่ใหม่ลงในระบบฐานข้อมูลคลาวด์...');

    try {
      const response = await runRequest('register', username, password, 'registerCallback');
      setLoading(false);
      
      if (response.success) {
        setAlertState({
          show: true,
          type: 'success',
          title: 'รับมอบภารกิจสำเร็จ!',
          message: 'สร้างบัญชีสายลับปฏิบัติการใหม่สำเร็จแล้ว! กรุณาใช้รหัสดังกล่าวลงชื่อเข้าใช้ระบบเพื่อเริ่มภารกิจ',
          onCloseAction: () => {
            setPassword('');
            setActiveModal('login');
          }
        });
      } else {
        showAlert('error', 'ระบบขัดข้อง', response.message || 'รหัสเจ้าหน้าที่นี้เคยได้รับการขึ้นทะเบียนแล้วในสารบบหลัก');
      }
    } catch (err) {
      setLoading(false);
      showAlert('error', 'บันทึกล้มเหลว', 'เกิดคลื่นสัญญาณแทรกแซง ไม่สามารถบันทึกข้อมูลเข้าฐานข้อมูลหลักได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Save config settings
  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('smpc_script_url', tempScriptUrl.trim());
    localStorage.setItem('smpc_target_url', tempTargetUrl.trim());
    setScriptUrl(tempScriptUrl.trim());
    setTargetUrl(tempTargetUrl.trim());
    
    setActiveModal(null);
    showAlert('success', 'ปรับแต่งพอร์ทัลสำเร็จ', 'อัปเดตช่องทาง API และปลายทางฐานบัญชาการลับเรียบร้อยแล้ว');
  };

  // Reset config to defaults
  const handleResetSettings = () => {
    setTempScriptUrl(DEFAULT_SCRIPT_URL);
    setTempTargetUrl(DEFAULT_TARGET_URL);
  };

  const showAlert = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    setAlertState({
      show: true,
      type,
      title,
      message
    });
  };

  const closeAlert = () => {
    const action = alertState.onCloseAction;
    setAlertState(prev => ({ ...prev, show: false }));
    if (action) {
      action();
    }
  };

  const openModal = (type: 'login' | 'register' | 'settings') => {
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setActiveModal(type);
  };

  const startFingerprintScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanResult('idle');
  };

  return (
    <div id="app_root" className="min-h-screen w-full relative overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Animated Cyber Futuristic Interactive Background */}
      <CyberBackground />
      
      {/* HUD Industrial Ambient Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 -z-10" />
      
      {/* Futuristic Background Lights & Holograms */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[80vw] h-96 bg-emerald-950/20 rounded-full filter blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-950/10 rounded-full filter blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-900/10 rounded-full filter blur-[100px] pointer-events-none -z-10" />

      {/* Futuristic Top Bar Info */}
      <header className="border-b border-emerald-950/50 bg-slate-950/80 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Active Terminal Info */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">SYS_SECURE_NODE: ACTIVE</p>
              <p className="text-[9px] font-mono text-slate-500">ENCRYPTION: AES-256-GCM</p>
            </div>
          </div>

          {/* Center Department Header */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/30 border border-emerald-900/40 rounded-full">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-medium tracking-wide text-emerald-300">SHE SMPC SECURE LINK</span>
          </div>

          {/* Right Clock / System Configuration Override Link */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block font-mono text-xs text-slate-400">{systemTime}</span>
            <motion.button
              id="btn_settings_trigger"
              whileHover={{ scale: 1.05, rotate: 45 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal('settings')}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all cursor-pointer"
              title="สลับหน้าการเชื่อมต่อข้อมูลและ API"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto w-full z-10">
        
        {/* PART 1: HEADER (หัวเว็บ) */}
        <div className="text-center mb-6 md:mb-8 space-y-4 max-w-2xl">
          
          {/* Animated SHEE Agent Logo Frame */}
          <div className="relative inline-flex justify-center items-center">
            {/* Spinning Radar circles */}
            <div className="absolute w-24 h-24 rounded-full border border-dashed border-emerald-500/20 animate-[spin_40s_linear_infinite]" />
            <div className="absolute w-20 h-20 rounded-full border border-emerald-500/30 animate-[ping_3s_ease-in-out_infinite] opacity-30" />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 p-5 bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-emerald-500/80 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.3)] text-emerald-400"
            >
              <ShieldAlert className="w-10 h-10" />
            </motion.div>
          </div>

          {/* System Alert Copywriting */}
          <div className="space-y-1.5 pt-2">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 bg-red-950/60 border border-red-800/60 rounded-full text-red-400 font-mono text-xs font-bold tracking-wider animate-pulse uppercase shadow-[0_0_15px_rgba(239,68,68,0.15)]"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              SYSTEM ALERT: CLASSIFIED MISSION
            </motion.div>
            
            <motion.h1 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl sm:text-3.5xl md:text-4xl font-extrabold tracking-tight leading-tight pt-1"
            >
              <span className="block text-slate-300 font-mono font-medium text-lg tracking-widest text-emerald-400">OPERATION: SHEE AGENTS</span>
              <span className="bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                ภารกิจลับ สยบความเสี่ยง พิทักษ์องค์กร
              </span>
            </motion.h1>
          </div>
        </div>

        {/* PART 2: HERO SECTION (คำโปรยตรงกลาง) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full text-center bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 md:p-6 mb-8 shadow-2xl relative overflow-hidden max-w-2xl"
        >
          {/* Subtle industrial corner elements for cyber styling */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500" />

          {/* Grid visual overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-300 tracking-wide font-sans px-2">
              &ldquo;ความปลอดภัยของทุกคน... ขึ้นอยู่กับการตัดสินใจของคุณ&rdquo;
            </h2>
            
            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-xl mx-auto">
              ขอเรียกตัวเจ้าหน้าที่ปฏิบัติการพิเศษ เข้าร่วมทลาย{' '}
              <span className="text-emerald-400 font-semibold underline decoration-dashed underline-offset-4 decoration-emerald-500/50 bg-emerald-950/20 px-1 rounded">5 ฐานความเสี่ยงในพื้นที่จริง</span>
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/30 border border-red-900/50 rounded-xl text-xs font-mono font-bold text-red-400">
                <Zap className="w-4 h-4 text-red-500 animate-pulse" />
                <span>เป้าหมาย: ZERO ACCIDENT</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950/30 border border-cyan-900/50 rounded-xl text-xs font-mono font-bold text-cyan-400">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>เป้าหมาย: ZERO WASTE</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PART 3: BUTTON GATES / ACTION CENTER (ปุ่มกดลงทะเบียน) */}
        <div className="w-full max-w-md space-y-6">
          
          {/* Fingerprint Interactive Scan Pad */}
          <motion.div
            id="fingerprint_scan_pad"
            whileHover={{ scale: 1.01 }}
            className="bg-slate-900/90 border-2 border-emerald-500/30 hover:border-emerald-500/60 rounded-3xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.05)] text-center relative overflow-hidden group transition-all"
          >
            {/* Hologram scanning ray line */}
            {isScanning && (
              <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] z-20"
              />
            )}

            <div className="space-y-4 relative z-10 flex flex-col items-center">
              
              <div className="text-xs font-mono tracking-widest text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                SECURE IDENTITY AUTHENTICATION
              </div>

              {/* Glowing Interactive Scanner Icon */}
              <button
                onClick={startFingerprintScan}
                disabled={isScanning}
                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                  isScanning 
                    ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-pulse' 
                    : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] group-active:scale-95'
                }`}
              >
                <Fingerprint className={`w-14 h-14 transition-all duration-300 ${
                  isScanning ? 'text-emerald-400 scale-105' : 'text-slate-500 group-hover:text-emerald-400'
                }`} />

                {/* Progress bar wrap */}
                {isScanning && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping opacity-25" />
                )}
              </button>

              <div className="space-y-1.5 w-full">
                {isScanning ? (
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-emerald-400 animate-pulse">กำลังสแกนลายนิ้วมือ... {scanProgress}%</p>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-emerald-950">
                      <div className="bg-emerald-400 h-full transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <button 
                      onClick={startFingerprintScan}
                      className="text-xs text-emerald-400 font-mono hover:underline tracking-wider uppercase cursor-pointer"
                    >
                      แตะเครื่องสแกนด้านบนเพื่อเริ่มต้น
                    </button>
                    <p className="text-[11px] text-slate-500">กรุณาลงทะเบียนรหัสเพื่อยืนยันการรับภารกิจครั้งนี้</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Action Gateway Primary Buttons (Warning Red to create urgency) */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            
            <motion.button
              id="btn_register_initiate"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal('register')}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold tracking-wider rounded-2xl shadow-[0_4px_20px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_25px_rgba(220,38,38,0.55)] border border-red-500/20 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="p-1.5 bg-white/10 rounded-lg">
                  <UserPlus className="w-5 h-5 text-white" />
                </span>
                <span className="font-semibold text-base sm:text-lg">SCAN FINGERPRINT TO ACCEPT MISSION</span>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </motion.button>

            <motion.button
              id="btn_login_initiate"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal('login')}
              className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/70 rounded-2xl font-semibold tracking-wide shadow-[0_2px_15px_rgba(16,185,129,0.05)] transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="p-1.5 bg-emerald-950/50 rounded-lg border border-emerald-900/30">
                  <User className="w-4 h-4 text-emerald-400" />
                </span>
                <span className="text-sm sm:text-base">ลงชื่อเข้าใช้งานสำหรับเจ้าหน้าที่เดิม</span>
              </div>
              <span className="text-xs text-slate-500 font-mono group-hover:text-emerald-400 flex items-center gap-1 transition-colors">
                [ SIGN IN ]
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </motion.button>

          </div>
          
          {/* Quick Informational footer note */}
          <p className="text-center text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            หากคุณไม่เคยเข้าร่วมงาน กรุณาสมัครเป็นเจ้าหน้าที่ปฏิบัติการพิเศษด้วยชื่อและรหัสผ่านส่วนตัวก่อน
          </p>

        </div>
      </main>

      {/* Cyber Modals Overlay container */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal Backdrop with deep blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Window Cyber themed */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.15)] w-full max-w-md overflow-hidden relative z-10"
            >
              
              {/* Colored Status accent line */}
              <div className={`h-1.5 w-full ${
                activeModal === 'login' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                activeModal === 'register' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
              }`} />

              <div className="p-6 md:p-8 relative">
                
                {/* Tech grid texture inside modals */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none" />

                {/* Header Row */}
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-2">
                      <LockKeyhole className={`w-5 h-5 ${activeModal === 'register' ? 'text-red-400' : 'text-emerald-400'}`} />
                      <h2 className="text-xl font-bold text-slate-100 font-mono tracking-wide uppercase">
                        {activeModal === 'login' && 'AGENT LOG IN'}
                        {activeModal === 'register' && 'AGENTS REGISTER'}
                        {activeModal === 'settings' && 'SYSTEM CONFIG'}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-sans">
                      {activeModal === 'login' && 'เข้าสู่ระบบบัญชีรหัสปฏิบัติการเดิมเพื่อเข้าร่วมภารกิจ'}
                      {activeModal === 'register' && 'ลงทะเบียนสร้างคีย์เข้ารหัสประจำตัวใหม่'}
                      {activeModal === 'settings' && 'แผงควบคุมระบบคีย์ API และความเชื่อมโยงเป้าหมาย'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Internal Content wrapper */}
                <div className="relative z-10">
                  
                  {/* LOGIN FORM */}
                  {activeModal === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono tracking-wider text-emerald-400 block uppercase">Username / รหัสสายลับ</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                            <User className="w-4 h-4" />
                          </span>
                          <input
                            id="loginUsername"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="กรอกชื่อผู้ใช้สำหรับเข้างาน"
                            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 focus:border-emerald-500 focus:bg-slate-950 rounded-xl text-slate-100 placeholder-slate-600 text-sm outline-none transition-all font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono tracking-wider text-emerald-400 block uppercase">Password / รหัสผ่าน</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input
                            id="loginPassword"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="กรอกรหัสความปลอดภัยเดิม"
                            className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 focus:border-emerald-500 focus:bg-slate-950 rounded-xl text-slate-100 placeholder-slate-600 text-sm outline-none transition-all font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          id="btn_login_submit"
                          type="submit"
                          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>ยืนยันสิทธิ์เพื่อเข้าใช้งาน</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-center text-xs text-slate-400 pt-1 font-sans">
                        ยังไม่มีรหัสความปลอดภัยปฏิบัติงาน?{' '}
                        <button
                          type="button"
                          onClick={() => openModal('register')}
                          className="text-red-400 hover:underline font-bold cursor-pointer"
                        >
                          สมัครสมาชิกที่นี่
                        </button>
                      </p>
                    </form>
                  )}

                  {/* REGISTER FORM */}
                  {activeModal === 'register' && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono tracking-wider text-red-400 block uppercase">Set Agent Code / ตั้งชื่อรหัสเจ้าหน้าที่</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                            <User className="w-4 h-4" />
                          </span>
                          <input
                            id="regUsername"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="ภาษาอังกฤษหรือตัวเลข (เช่น AgentSMPC01)"
                            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 hover:border-red-500/50 focus:border-red-500 focus:bg-slate-950 rounded-xl text-slate-100 placeholder-slate-600 text-sm outline-none transition-all font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono tracking-wider text-red-400 block uppercase">Security Passcode / ตั้งรหัสผ่าน</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input
                            id="regPassword"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="ความสั้นอย่างน้อย 4 ตัวอักษร"
                            className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 hover:border-red-500/50 focus:border-red-500 focus:bg-slate-950 rounded-xl text-slate-100 placeholder-slate-600 text-sm outline-none transition-all font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          id="btn_register_submit"
                          type="submit"
                          className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>ACCEPT CLASSIFIED MISSION / สมัครสมาชิก</span>
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-center text-xs text-slate-400 pt-1 font-sans">
                        มีบัญชีเจ้าหน้าที่อยู่แล้วใช่หรือไม่?{' '}
                        <button
                          type="button"
                          onClick={() => openModal('login')}
                          className="text-emerald-400 hover:underline font-bold cursor-pointer"
                        >
                          ลงชื่อเข้าใช้ระบบ
                        </button>
                      </p>
                    </form>
                  )}

                  {/* SETTINGS / CONFIG FORM */}
                  {activeModal === 'settings' && (
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div className="p-3 bg-slate-950 rounded-xl border border-emerald-950 text-slate-300 text-xs leading-relaxed space-y-1">
                        <p className="font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
                          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                          [CORE INTERNET API MODULE OVERRIDE]
                        </p>
                        <p className="font-sans">แอดมินหรือผู้ควบคุมระบบ สามารถตั้งค่า SCRIPT URL ที่เชื่อมต่อกับ Google Sheets และ LINK เว็บไซต์ปลายทางที่ต้องการนำทางไปเมื่อสแกนตัวตนสำเร็จ</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase">Google Apps Script Web App API URL</label>
                        <textarea
                          rows={2}
                          value={tempScriptUrl}
                          onChange={(e) => setTempScriptUrl(e.target.value)}
                          placeholder="https://script.google.com/macros/s/..."
                          className="w-full p-3 bg-slate-950 border border-slate-800 focus:border-slate-650 rounded-xl text-slate-200 placeholder-slate-700 text-xs font-mono outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase font-mono">Target Destination Link (XXX)</label>
                        <input
                          type="text"
                          value={tempTargetUrl}
                          onChange={(e) => setTempTargetUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full p-3 bg-slate-950 border border-slate-800 focus:border-slate-650 rounded-xl text-slate-200 placeholder-slate-700 text-xs font-mono outline-none transition-all"
                        />
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={handleResetSettings}
                          className="flex-1 py-2.5 px-3 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 font-medium text-xs rounded-xl transition-all cursor-pointer font-mono"
                        >
                          RESET TO SYSTEM DEFAULTS
                        </button>
                        <button
                          id="btn_save_settings"
                          type="submit"
                          className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>SAVE CONFIGURATION</span>
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Redirection Countdown Overlay (Post-Login success) */}
      <AnimatePresence>
        {redirectCountdown !== null && (
          <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="max-w-md w-full space-y-6 relative z-10"
            >
              <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-3xl mb-2 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <CheckCircle2 className="w-16 h-16 animate-pulse" />
              </div>
              <h2 className="text-3xl font-extrabold text-white font-sans">อนุมัติการเข้าถึงระบบสายลับสำเร็จ!</h2>
              <p className="text-slate-400 text-sm font-light">
                รหัสความปลอดภัยเข้าคีย์ถอดรหัสเรียบร้อย ระบบกำลังส่งตัวท่านไปยังฐานบัญชาการกิจกรรม <br />
                <span className="text-emerald-400 font-mono font-medium block mt-2 text-xs break-all bg-slate-900 p-2.5 rounded-xl border border-emerald-950">{targetUrl}</span>
              </p>
              
              <div className="relative flex items-center justify-center py-4">
                <div className="w-24 h-24 rounded-full border-4 border-slate-900 bg-slate-950 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)] border-t-emerald-500">
                  <span className="text-4xl font-black text-emerald-400">{redirectCountdown}</span>
                  <span className="text-[9px] text-slate-500 font-mono">SECONDS</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => { window.location.href = targetUrl; }}
                  className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold tracking-wider rounded-xl shadow-[0_4px_20px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_25px_rgba(220,38,38,0.55)] transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>WARP IMMEDIATELY / เดินทางไปทันที</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM STATUS/ALERT NOTIFICATION TOAST/DIALOG OVERLAY */}
      <AnimatePresence>
        {alertState.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dark backing overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAlert}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs"
            />
            
            {/* Modal Dialog card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 text-center space-y-4"
            >
              <div className="flex flex-col items-center">
                {alertState.type === 'success' && (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 rounded-full mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                )}
                {alertState.type === 'error' && (
                  <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-400 rounded-full mb-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <XCircle className="w-10 h-10" />
                  </div>
                )}
                {alertState.type === 'warning' && (
                  <div className="p-3 bg-amber-950/50 border border-amber-500/30 text-amber-400 rounded-full mb-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <HelpCircle className="w-10 h-10" />
                  </div>
                )}

                <h3 className="text-lg font-bold text-slate-100 font-mono tracking-wide leading-snug">{alertState.title}</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{alertState.message}</p>
              </div>

              <div className="pt-2">
                <button
                  id="btn_alert_ok"
                  onClick={closeAlert}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-widest transition-colors cursor-pointer ${
                    alertState.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950' :
                    alertState.type === 'error' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                  }`}
                >
                  ACKNOWLEDGE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Activity Loading overlay */}
      <AnimatePresence>
        {loading && (
          <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-xs w-full flex flex-col items-center space-y-4"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-emerald-400 font-mono text-xs tracking-wider uppercase animate-pulse">{loadingText}</p>
                <p className="text-slate-500 text-[10px] font-sans">กำลังเปิดช่องสัญญาณข้อมูลผ่านเกตเวย์ความปลอดภัย...</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant Cyber Footer */}
      <footer className="py-4 border-t border-emerald-950/30 text-center text-slate-600 text-[10px] font-mono bg-slate-950">
        <p className="tracking-widest">© 2026 SHEE AGENTS SYSTEM SECURITY CORE. ALL RIGHTS RESERVED.</p>
        <p className="text-slate-700 mt-0.5 font-light">SMPC LEVEL 5 SECURITY DIRECTIVE CONFIRMED</p>
      </footer>

    </div>
  );
}
