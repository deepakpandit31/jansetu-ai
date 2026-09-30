import React, { useState, useEffect } from 'react';
import {
  Mic,
  Send,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Globe,
  Bell,
  User as UserIcon,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock,
  ThumbsUp,
  X,
  FileText,
  Wifi,
  WifiOff,
  Check,
  FlipHorizontal,
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Compass,
  LocateFixed,
  Edit3,
  ChevronDown,
} from 'lucide-react';
import {
  CitizenRequest,
  RequestCategory,
  UrgencyLevel,
} from '../../../packages/shared/src/types';
import {
  SUPPORTED_LANGUAGES,
  getTranslation,
  isRtl,
} from '../../../packages/shared/src/translations';
import {
  CATEGORY_DETAILS,
  STATUS_COLORS,
  INDIAN_STATES_DISTRICTS,
} from '../../../packages/shared/src/constants';

const CATEGORY_META: Record<string, { icon: string; color: string; bg: string }> = {
  WATER: { icon: '💧', color: 'text-blue-700', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
  ROAD: { icon: '🛣️', color: 'text-amber-700', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  ROAD_AND_TRANSPORT: { icon: '🛣️', color: 'text-amber-700', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  HEALTHCARE: { icon: '🏥', color: 'text-rose-700', bg: 'bg-rose-50 text-rose-800 border-rose-200' },
  EDUCATION: { icon: '🏫', color: 'text-indigo-700', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  SANITATION: { icon: '🧹', color: 'text-emerald-700', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ELECTRICITY: { icon: '⚡', color: 'text-yellow-700', bg: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  PUBLIC_TRANSPORT: { icon: '🚌', color: 'text-cyan-700', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  DIGITAL_CONNECTIVITY: { icon: '📶', color: 'text-purple-700', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
  HOUSING: { icon: '🏠', color: 'text-orange-700', bg: 'bg-orange-50 text-orange-800 border-orange-200' },
  AGRICULTURE: { icon: '🌾', color: 'text-green-700', bg: 'bg-green-50 text-green-800 border-green-200' },
  DRAINAGE_AND_FLOODING: { icon: '🌊', color: 'text-teal-700', bg: 'bg-teal-50 text-teal-800 border-teal-200' },
  DISASTER_RESILIENCE: { icon: '🛡️', color: 'text-red-700', bg: 'bg-red-50 text-red-800 border-red-200' },
  PUBLIC_SAFETY: {
    icon: '🚨',
    color: 'text-violet-700',
    bg: 'bg-violet-50 text-violet-800 border-violet-200'
  },

  OTHER: {
    icon: '📌',
    color: 'text-slate-700',
    bg: 'bg-slate-50 text-slate-800 border-slate-200'
  },
};

export const INDIAN_DISTRICT_COORDS: Array<{
  state: string;
  district: string;
  village: string;
  lat: number;
  lng: number;
}> = [
    { state: 'Rajasthan', district: 'Barmer', village: 'Shivnagar', lat: 25.7521, lng: 71.3967 },
    { state: 'Rajasthan', district: 'Jaipur', village: 'Civil Lines', lat: 26.9124, lng: 75.7873 },
    { state: 'Rajasthan', district: 'Jodhpur', village: 'Sardarpura', lat: 26.2389, lng: 73.0243 },
    { state: 'Rajasthan', district: 'Udaipur', village: 'Fatehsagar', lat: 24.5854, lng: 73.7125 },
    { state: 'Rajasthan', district: 'Bikaner', village: 'Karni Nagar', lat: 28.0229, lng: 73.3119 },
    { state: 'Delhi', district: 'New Delhi', village: 'Connaught Place', lat: 28.6139, lng: 77.2090 },
    { state: 'Maharashtra', district: 'Mumbai Suburban', village: 'Andheri East', lat: 19.0760, lng: 72.8777 },
    { state: 'Maharashtra', district: 'Pune', village: 'Shivajinagar', lat: 18.5204, lng: 73.8567 },
    { state: 'Karnataka', district: 'Bengaluru Urban', village: 'Indiranagar', lat: 12.9716, lng: 77.5946 },
    { state: 'Uttar Pradesh', district: 'Lucknow', village: 'Hazratganj', lat: 26.8467, lng: 80.9462 },
    { state: 'Bihar', district: 'Patna', village: 'Kankarbagh', lat: 25.5941, lng: 85.1376 },
    { state: 'Gujarat', district: 'Ahmedabad', village: 'Navrangpura', lat: 23.0225, lng: 72.5714 },
    { state: 'Madhya Pradesh', district: 'Bhopal', village: 'Arera Colony', lat: 23.2599, lng: 77.4126 },
    { state: 'Tamil Nadu', district: 'Chennai', village: 'T Nagar', lat: 13.0827, lng: 80.2707 },
    { state: 'Telangana', district: 'Hyderabad', village: 'Banjara Hills', lat: 17.3850, lng: 78.4867 },
    { state: 'West Bengal', district: 'Kolkata', village: 'Salt Lake', lat: 22.5726, lng: 88.3639 },
  ];

interface CitizenMobileAppProps {
  onOpenDashboard?: () => void;
  onRequestCreated?: (req: CitizenRequest) => void;
  initialLang?: string;
  onLanguageChange?: (lang: string) => void;
}

export const CitizenMobileApp: React.FC<CitizenMobileAppProps> = ({
  onOpenDashboard,
  onRequestCreated,
  initialLang,
  onLanguageChange,
}) => {
  const [currentLang, setCurrentLangState] = useState<string>(() => {
    return initialLang || localStorage.getItem('jansetu_selected_lang') || 'hi';
  });

  const setCurrentLang = (lang: string) => {
    setCurrentLangState(lang);
    try {
      localStorage.setItem('jansetu_selected_lang', lang);
    } catch { }
    if (onLanguageChange) onLanguageChange(lang);
  };
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('jansetu_access_token');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (initialLang && initialLang !== currentLang) {
      setCurrentLangState(initialLang);
    }
  }, [initialLang]);

  const t = getTranslation(currentLang);
  const isRtlMode = isRtl(currentLang);
  const [activeTab, setActiveTab] = useState<'home' | 'requests' | 'nearby' | 'notifications' | 'profile'>('home');
  const [requests, setRequests] = useState<CitizenRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Request creation flow state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [inputMode, setInputMode] = useState<'voice' | 'text' | 'photo'>('voice');
  const [inputText, setInputText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [hasRecordedAudio, setHasRecordedAudio] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Live Camera state & hardware refs
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [flashEffect, setFlashEffect] = useState<boolean>(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Callback ref guarantees properties and stream are cleanly bound as soon as the video DOM node mounts
  const setVideoRef = React.useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node) {
      node.muted = true;
      node.defaultMuted = true;
      node.playsInline = true;
      node.setAttribute('playsinline', 'true');
      node.setAttribute('webkit-playsinline', 'true');
      if (streamRef.current) {
        node.srcObject = streamRef.current;
        node.onloadedmetadata = () => {
          node.play().catch((e) => console.warn('Video play error on metadata:', e));
        };
        node.play().catch((e) => console.warn('Direct video play error:', e));
      }
    }
  }, []);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) { }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraLoading(false);
  }, []);

  const startCamera = React.useCallback(async (facing: 'environment' | 'user' = cameraFacing) => {
    stopCamera();
    setCameraLoading(true);
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware API is not supported on this browser/environment.');
      }

      let stream: MediaStream;
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintErr) {
        console.warn('Ideal camera constraints failed, attempting fallback with video: true', constraintErr);
        // Fallback for laptops, external webcams, or environments that reject specific resolution/facing constraints
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      setCameraActive(true);

      // Attach stream immediately if video element is already rendered
      if (videoRef.current) {
        const v = videoRef.current;
        v.muted = true;
        v.defaultMuted = true;
        v.playsInline = true;
        v.setAttribute('playsinline', 'true');
        v.setAttribute('webkit-playsinline', 'true');
        v.srcObject = stream;
        v.onloadedmetadata = () => {
          v.play().catch(() => { });
        };
        await v.play().catch(() => { });
      }
    } catch (err: any) {
      console.warn('[Camera Access Error]:', err);
      let msg = 'Unable to access device camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. You can grant camera access in browser settings, upload a photo, or choose from verified infrastructure samples below.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera hardware found on this system. You can upload an image file from your device or use sample civic photos below.';
      } else if (err.name === 'NotReadableError') {
        msg = 'Camera is currently locked or in use by another program.';
      } else if (err.name === 'OverconstrainedError') {
        msg = 'Camera resolution constraints not supported by your camera hardware.';
      }
      setCameraError(msg);
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  }, [cameraFacing, stopCamera]);

  // Keep stream synced with video element across re-renders
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => { });
      }
    }
  }, [cameraActive]);

  // Bulletproof Canvas Photo Capture directly from live video element (fixes black photo bug)
  const capturePhoto = React.useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      console.warn('Cannot capture photo: video element not attached');
      return;
    }

    try {
      setFlashEffect(true);
      setTimeout(() => setFlashEffect(false), 200);

      // Ensure video is actively playing before capturing frame
      if (video.paused) {
        try {
          await video.play();
        } catch (e) {
          console.warn('Could not resume video play before frame grab:', e);
        }
      }

      // Check readyState - wait up to 300ms if video hasn't decoded current frame
      if (video.readyState < 2) {
        await new Promise((resolve) => {
          const onCanPlay = () => {
            video.removeEventListener('canplay', onCanPlay);
            resolve(true);
          };
          video.addEventListener('canplay', onCanPlay);
          setTimeout(resolve, 250);
        });
      }

      let vw = video.videoWidth;
      let vh = video.videoHeight;
      if (!vw || !vh) {
        vw = video.clientWidth || 1280;
        vh = video.clientHeight || 720;
      }

      // Clamp dimensions for optimal performance and crisp clarity
      const maxDim = 1280;
      let targetW = vw;
      let targetH = vh;
      if (targetW > maxDim || targetH > maxDim) {
        if (targetW > targetH) {
          targetH = Math.round((targetH * maxDim) / targetW);
          targetW = maxDim;
        } else {
          targetW = Math.round((targetW * maxDim) / targetH);
          targetH = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas 2D rendering context');

      // Mirror horizontally for front-facing camera for natural selfie orientation
      if (cameraFacing === 'user') {
        ctx.translate(targetW, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, targetW, targetH);

      // Validate image brightness to prevent accidental pitch-black captures
      try {
        const sampleW = Math.min(targetW, 40);
        const sampleH = Math.min(targetH, 40);
        const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
        let totalBrightness = 0;
        const totalPixels = imgData.data.length / 4;
        for (let i = 0; i < imgData.data.length; i += 4) {
          totalBrightness += (imgData.data[i] * 0.299 + imgData.data[i + 1] * 0.587 + imgData.data[i + 2] * 0.114);
        }
        const avgBrightness = totalBrightness / (totalPixels || 1);
        if (avgBrightness < 3) {
          console.warn('Captured frame appears dark or covered (avgBrightness:', avgBrightness, ')');
          setCameraError('The captured photo appeared completely dark. Check that camera lens is uncovered, or choose a verified sample photo below.');
        } else {
          setCameraError(null);
        }
      } catch (pixErr) {
        // Cross-origin restriction safeguard
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setSelectedPhoto(dataUrl);
      stopCamera();
      if (!inputText) {
        setInputText('Visual infrastructure issue captured on site.');
      }
    } catch (e) {
      console.error('Photo capture error:', e);
      setCameraError('Photo capture encountered an error. Please try again or upload a photo.');
    }
  }, [cameraFacing, inputText, stopCamera]);

  const handleFileUpload = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedPhoto(reader.result);
        stopCamera();
        if (!inputText) {
          setInputText('Photo evidence uploaded for civic infrastructure report.');
        }
      }
    };
    reader.readAsDataURL(file);
  }, [inputText, stopCamera]);

  const toggleCameraFacing = React.useCallback(() => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (cameraActive) {
      startCamera(nextFacing);
    }
  }, [cameraFacing, cameraActive, startCamera]);

  // Clean shutdown of camera hardware when modal closes or switching input tabs
  useEffect(() => {
    if (!isModalOpen || inputMode !== 'photo') {
      stopCamera();
    }
  }, [isModalOpen, inputMode, stopCamera]);

  // Location state & Live GPS Detection
  const [locationName, setLocationName] = useState<string>('Shivnagar, Chohtan, Barmer, Rajasthan');
  const [latitude, setLatitude] = useState<number>(25.7521);
  const [longitude, setLongitude] = useState<number>(71.3967);
  const [isLocationBlurred, setIsLocationBlurred] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState<boolean>(false);
  const [selectedState, setSelectedState] = useState<string>('Rajasthan');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Barmer');
  const [selectedVillage, setSelectedVillage] = useState<string>('Shivnagar');

  // Real GPS Location Detection with 2-stage High/Low Accuracy and Indian Coordinate Fallback
  const fetchLiveGps = React.useCallback(async () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Please choose your district from the quick pills or dropdown below.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    const applyPosition = async (pos: GeolocationPosition) => {
      const lat = Number(pos.coords.latitude.toFixed(6));
      const lng = Number(pos.coords.longitude.toFixed(6));
      const acc = Math.round(pos.coords.accuracy || 15);

      setLatitude(lat);
      setLongitude(lng);
      setGpsAccuracy(acc);

      // Step A: Attempt reverse geocoding via OpenStreetMap Nominatim with strict timeout
      let reverseResolved = false;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
          { signal: controller.signal }
        );
        clearTimeout(timer);
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const locality = addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.city || 'Local Area';
          const dist = addr.state_district || addr.county || addr.district || 'District';
          const st = addr.state || 'State';

          setSelectedVillage(locality);
          setSelectedDistrict(dist);
          setSelectedState(st);
          setLocationName(`${locality}, ${dist}, ${st}`);
          reverseResolved = true;
        }
      } catch {
        // Reverse geocoding fetch timed out or CORS restricted
      }

      // Step B: If Nominatim didn't resolve, match closest Indian district by distance
      if (!reverseResolved) {
        let closest = INDIAN_DISTRICT_COORDS[0];
        let minDist = Infinity;
        for (const loc of INDIAN_DISTRICT_COORDS) {
          const d = Math.hypot(loc.lat - lat, loc.lng - lng);
          if (d < minDist) {
            minDist = d;
            closest = loc;
          }
        }

        if (minDist < 4.0) {
          setSelectedVillage(closest.village);
          setSelectedDistrict(closest.district);
          setSelectedState(closest.state);
          setLocationName(`${closest.village}, ${closest.district}, ${closest.state}`);
        } else {
          setLocationName(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
        }
      }

      setGpsLoading(false);
    };

    // Stage 1: Try high accuracy first (5 second timeout)
    navigator.geolocation.getCurrentPosition(
      applyPosition,
      (highAccErr) => {
        console.warn('High accuracy GPS timed out or failed, falling back to standard network positioning:', highAccErr);
        // Stage 2: Fallback to standard network/Wi-Fi positioning (5 second timeout)
        navigator.geolocation.getCurrentPosition(
          applyPosition,
          (lowAccErr) => {
            console.warn('Standard geolocation failed:', lowAccErr);
            setGpsLoading(false);
            if (lowAccErr.code === 1) {
              setGpsError('GPS permission denied in browser. Select any district below with 1 tap.');
            } else if (lowAccErr.code === 2) {
              setGpsError('GPS position unavailable. Select your district from the quick pills or dropdown below.');
            } else {
              setGpsError('GPS request timed out. Select your district from the quick pills or dropdown below.');
            }
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  // Auto-acquire GPS once when user opens request modal
  useEffect(() => {
    if (isModalOpen && !gpsAccuracy && !gpsLoading) {
      fetchLiveGps();
    }
  }, [isModalOpen, gpsAccuracy, gpsLoading, fetchLiveGps]);

  // AI Verification Step & Category Correction
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [showAiConfirmation, setShowAiConfirmation] = useState<boolean>(false);
  const [correctedCategory, setCorrectedCategory] = useState<RequestCategory | null>(null);
  const [isEditingCategory, setIsEditingCategory] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<CitizenRequest | null>(null);
  const recognitionRef = React.useRef<any>(null);

  // Notification count & Offline Drafts
  const [unreadNotifs, setUnreadNotifs] = useState<number>(1);
  const [offlineDrafts, setOfflineDrafts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('jansetu_offline_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<{
    visible: boolean;
    title: string;
    message: string;
    count: number;
    timestamp: string;
    type: 'sync-success' | 'offline-saved' | 'info';
  } | null>(null);

  // Auto-dismiss toast notification after 4.5 seconds
  useEffect(() => {
    if (!syncToast?.visible) return;
    const timer = setTimeout(() => {
      setSyncToast((prev) => (prev ? { ...prev, visible: false } : null));
    }, 4500);
    return () => clearTimeout(timer);
  }, [syncToast?.visible]);

  // Synchronize pending offline drafts with backend
  const syncOfflineDrafts = async (draftsToSync?: any[]): Promise<number> => {
    let pending = draftsToSync;
    if (!pending) {
      try {
        const saved = localStorage.getItem('jansetu_offline_drafts');
        pending = saved ? JSON.parse(saved) : [];
      } catch {
        pending = [];
      }
    }

    if (!pending || pending.length === 0) return 0;

    setIsSyncing(true);
    const remaining: any[] = [];
    let syncedCount = 0;

    for (const draft of pending) {
      try {
        const payload = {
          ...draft.payload,
          originalText:
            draft.payload?.originalText ||
            draft.payload?.description ||
            draft.payload?.title ||
            'Citizen civic report',
        };

        const res = await fetch('/api/v1/requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': draft.idempotencyKey || `draft-${Date.now()}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.request) {
          syncedCount++;
          setRequests((prev) => [data.request, ...prev.filter((r) => r.id !== data.request.id)]);
          if (onRequestCreated) onRequestCreated(data.request);
        } else {
          remaining.push(draft);
        }
      } catch (err) {
        console.warn('Network issue syncing offline draft, retained in local storage:', err);
        remaining.push(draft);
      }
    }

    setOfflineDrafts(remaining);
    localStorage.setItem('jansetu_offline_drafts', JSON.stringify(remaining));
    setIsSyncing(false);

    if (syncedCount > 0) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSyncToast({
        visible: true,
        type: 'sync-success',
        title: 'Network Reconnected',
        message:
          syncedCount === 1
            ? '1 pending offline draft has been successfully synced to the backend.'
            : `${syncedCount} pending offline drafts have been successfully synced to the backend.`,
        count: syncedCount,
        timestamp: nowStr,
      });

      // Dispatch global window event for dashboard or monorepo components
      window.dispatchEvent(
        new CustomEvent('jansetu:offline-drafts-synced', {
          detail: { count: syncedCount, timestamp: nowStr },
        })
      );
    }

    return syncedCount;
  };

  // Fetch initial requests and subscribe to SSE real-time updates & network connectivity
  useEffect(() => {
    fetchRequests();

    // Check if there are already pending drafts on mount and device is online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const saved = localStorage.getItem('jansetu_offline_drafts');
        const parsed = saved ? JSON.parse(saved) : [];
        if (parsed.length > 0) {
          syncOfflineDrafts(parsed);
        }
      } catch (e) { }
    }

    // Setup Server-Sent Events (SSE) for live request state sync
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/v1/events');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'REQUEST_STATUS_UPDATED') {
            setRequests((prev) =>
              prev.map((r) => (r.id === payload.requestId ? { ...r, status: payload.status } : r))
            );
            setUnreadNotifs((cnt) => cnt + 1);
          }
        } catch (e) { }
      };
    } catch (e) {
      console.warn('SSE not connected:', e);
    }

    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync of pending drafts immediately upon network reconnection
      syncOfflineDrafts();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      eventSource?.close();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/requests?limit=50');
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };


  // Timer for voice recording
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartVoice = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setHasRecordedAudio(false);

    // Initialize browser SpeechRecognition if available
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang =
          currentLang === 'hi'
            ? 'hi-IN'
            : currentLang === 'ta'
              ? 'ta-IN'
              : currentLang === 'te'
                ? 'te-IN'
                : currentLang === 'bn'
                  ? 'bn-IN'
                  : currentLang === 'mr'
                    ? 'mr-IN'
                    : currentLang === 'gu'
                      ? 'gu-IN'
                      : currentLang === 'kn'
                        ? 'kn-IN'
                        : currentLang === 'ml'
                          ? 'ml-IN'
                          : currentLang === 'pa'
                            ? 'pa-IN'
                            : currentLang === 'ur'
                              ? 'ur-IN'
                              : 'en-IN';

        recognition.onresult = (event: any) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          if (text.trim()) {
            setInputText(text);
          }
        };
        recognition.onerror = (e: any) => {
          console.warn('Speech recognition notice:', e);
        };
        recognition.start();
      } catch (err) {
        console.warn('Could not start Web Speech Recognition:', err);
      }
    }
  };

  const handleStopVoice = async () => {
    setIsRecording(false);
    setHasRecordedAudio(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { }
    }

    let statement = inputText.trim();
    if (!statement) {
      // Natural language water statement default across Indian languages (Never default to Road!)
      statement =
        currentLang === 'hi'
          ? 'हमारे गांव में पानी की समस्या है।'
          : currentLang === 'bn'
            ? 'আমাদের গ্রামে পানীয় জলের সমস্যা রয়েছে।'
            : currentLang === 'ta'
              ? 'எங்கள் கிராமத்தில் குடிநீர் பிரச்சனை உள்ளது.'
              : currentLang === 'te'
                ? 'మా గ్రామంలో తాగునీటి సమస్య ఉంది.'
                : currentLang === 'mr'
                  ? 'आमच्या गावात पिण्याच्या पाण्याची समस्या आहे.'
                  : currentLang === 'gu'
                    ? 'અમારા ગામમાં પીવાના પાણીની સમસ્યા છે.'
                    : currentLang === 'kn'
                      ? 'ನಮ್ಮ ಗ್ರಾಮದಲ್ಲಿ ಕುಡಿಯುವ ನೀರಿನ ಸಮಸ್ಯೆ ಇದೆ.'
                      : currentLang === 'ml'
                        ? 'ഞങ്ങളുടെ ഗ്രാമത്തിൽ കുടിവെള്ള പ്രശ്നമുണ്ട്.'
                        : currentLang === 'pa'
                          ? 'ਸਾਡੇ ਪਿੰਡ ਵਿੱਚ ਪੀਣ ਵਾਲੇ ਪਾਣੀ ਦੀ ਸਮੱਸਿਆ ਹੈ।'
                          : currentLang === 'or'
                            ? 'ଆମ ଗାଁରେ ପାନୀୟ ଜଳର ସମସ୍ୟା ଅଛି।'
                            : currentLang === 'as'
                              ? 'আমাৰ গাঁৱত খোৱা পানীৰ সমস্যা আছে।'
                              : currentLang === 'ur'
                                ? 'ہمارے گاؤں میں پینے کے پانی کا مسئلہ ہے۔'
                                : currentLang === 'en'
                                  ? 'There is a water issue in my village.'
                                  : 'Hamare gaon mein paani ki problem hai.';
      setInputText(statement);
    }

    // Trigger AI interpretation
    await processAIAnalysis(statement);
  };

  const processAIAnalysis = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          state: 'Rajasthan',
          district: 'Barmer',
          block: 'Chohtan',
          village: 'Shivnagar',
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysisResult(data.analysis);
        setCorrectedCategory(null);
        setIsEditingCategory(false);
        setShowAiConfirmation(true);
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmAndSubmit = async () => {
    if (!aiAnalysisResult) return;
    setSubmitting(true);
    try {
      const finalCategory = correctedCategory || aiAnalysisResult.primaryCategory;
      const payload: any = {
        title: aiAnalysisResult.summary || 'Citizen Infrastructure Request',
        description: aiAnalysisResult.detectedProblem || aiAnalysisResult.problem,
        originalText: aiAnalysisResult.originalText,
        sanitizedText: aiAnalysisResult.sanitizedText,
        translatedText: aiAnalysisResult.translatedText,
        language: aiAnalysisResult.detectedLanguage || currentLang,
        detectedLanguage: aiAnalysisResult.detectedLanguage,
        languageType: aiAnalysisResult.languageType,
        category: finalCategory,
        aiCategory: aiAnalysisResult.primaryCategory,
        correctedCategory: correctedCategory || undefined,
        subcategory: aiAnalysisResult.subcategory,
        secondaryCategory: aiAnalysisResult.secondaryCategory,
        urgency: aiAnalysisResult.urgency,
        categoryConfidence: aiAnalysisResult.categoryConfidence,
        overallConfidence: aiAnalysisResult.overallConfidence,
        needsClarification: aiAnalysisResult.needsClarification,
        reasoningSummary: aiAnalysisResult.reasoningSummary,
        // Privacy: optionally blur exact GPS coordinates to send only district and block level data
        ...(isLocationBlurred
          ? {
            isLocationBlurred: true,
            locationPrecision: 'APPROXIMATE',
            locationSource: 'MANUAL_SELECTION',
            accuracyMeters: null,
          }
          : {
            latitude,
            longitude,
            village: selectedVillage || 'Local Area',
            isLocationBlurred: false,
            locationPrecision: 'EXACT',
            locationSource: gpsAccuracy ? 'GPS' : 'MANUAL_SELECTION',
            accuracyMeters: gpsAccuracy || 15,
          }),
        state: selectedState || 'Rajasthan',
        district: selectedDistrict || 'Barmer',
        block: selectedDistrict ? `${selectedDistrict} Block` : 'Chohtan',
        mediaUrls: selectedPhoto ? [selectedPhoto] : [],
      };

      const idempKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // If device is offline, store draft locally and notify user gracefully
      if (!isOnline) {
        const draftObj = {
          idempotencyKey: idempKey,
          payload,
          timestamp: new Date().toISOString(),
        };
        const updated = [draftObj, ...offlineDrafts];
        setOfflineDrafts(updated);
        localStorage.setItem('jansetu_offline_drafts', JSON.stringify(updated));
        setShowAiConfirmation(false);
        setIsModalOpen(false);
        setCorrectedCategory(null);
        setIsEditingCategory(false);
        setSubmitting(false);

        setSyncToast({
          visible: true,
          type: 'offline-saved',
          title: 'Offline Draft Saved',
          message: isLocationBlurred
            ? 'Saved to local device queue with blurred privacy coordinates. Will sync when reconnected.'
            : 'Saved to local device queue. Will sync automatically when network reconnects.',
          count: updated.length,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        return;
      }
      const res = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempKey,
          'x-demo-role': 'CITIZEN',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.request) {
        setSubmissionSuccess(data.request);
        setRequests((prev) => [data.request, ...prev]);
        setShowAiConfirmation(false);
        setIsModalOpen(false);
        setCorrectedCategory(null);
        setIsEditingCategory(false);
        if (onRequestCreated) onRequestCreated(data.request);
      }
    } catch (err) {
      console.warn('Network issue during submission. Saving request to offline draft queue.');
      const finalCategory = correctedCategory || aiAnalysisResult.primaryCategory;
      const draftObj = {
        idempotencyKey: `idemp-${Date.now()}`,
        payload: {
          title: aiAnalysisResult.summary || 'Citizen Infrastructure Request',
          description: aiAnalysisResult.detectedProblem || aiAnalysisResult.problem,
          originalText: aiAnalysisResult.originalText,
          language: aiAnalysisResult.language || currentLang,
          category: finalCategory,
          aiCategory: aiAnalysisResult.primaryCategory,
          correctedCategory: correctedCategory || undefined,
          ...(isLocationBlurred
            ? {
              isLocationBlurred: true,
              locationPrecision: 'APPROXIMATE',
              locationSource: 'MANUAL_SELECTION',
              accuracyMeters: null,
            }
            : {
              latitude,
              longitude,
              village: selectedVillage || 'Local Area',
              isLocationBlurred: false,
              locationPrecision: 'EXACT',
              locationSource: gpsAccuracy ? 'GPS' : 'MANUAL_SELECTION',
              accuracyMeters: gpsAccuracy || 15,
            }),
          state: selectedState || 'Rajasthan',
          district: selectedDistrict || 'Barmer',
          block: selectedDistrict ? `${selectedDistrict} Block` : 'Chohtan',
        },
        timestamp: new Date().toISOString(),
      };
      const updated = [draftObj, ...offlineDrafts];
      setOfflineDrafts(updated);
      localStorage.setItem('jansetu_offline_drafts', JSON.stringify(updated));
      setShowAiConfirmation(false);
      setIsModalOpen(false);
      setCorrectedCategory(null);
      setIsEditingCategory(false);

      // Subtle toast notification instead of alert
      setSyncToast({
        visible: true,
        type: 'offline-saved',
        title: 'Offline Draft Saved',
        message: 'Saved to local device queue due to network loss. Will sync automatically upon reconnection.',
        count: updated.length,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (currentLang === 'hi') utterance.lang = 'hi-IN';
      else if (currentLang === 'en') utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 font-sans select-none overflow-hidden relative">
      {/* Top Mobile App Bar */}
      <header className="bg-teal-800 text-white px-4 py-3 shadow-md flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 border border-teal-400 flex items-center justify-center font-bold text-white shadow-sm">
            JS
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-tight flex items-center gap-1">
              {t.appName}
              <span className="text-[10px] bg-teal-900/80 text-teal-200 px-1.5 py-0.2 rounded font-medium border border-teal-700">
                CITIZEN
              </span>
            </h1>
            <p className="text-[11px] text-teal-100 font-light truncate max-w-[210px]">
              {t.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              aria-label="Select preferred language"
              className="bg-teal-900/90 text-teal-100 text-xs font-medium py-1 px-2.5 rounded-md border border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer appearance-none pr-6"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.name}
                </option>
              ))}
            </select>
            <Globe className="w-3.5 h-3.5 text-teal-300 absolute right-1.5 top-2 pointer-events-none" />
          </div>

          {/* Network connectivity toggle / indicator */}
          <button
            onClick={() => {
              if (isOnline) {
                setIsOnline(false);
              } else {
                setIsOnline(true);
                syncOfflineDrafts();
              }
            }}
            className={`p-1.5 rounded-full transition flex items-center justify-center ${isOnline
                ? 'text-teal-200 hover:bg-teal-700/80 hover:text-white'
                : 'text-amber-300 bg-amber-950/80 border border-amber-500/70 animate-pulse'
              }`}
            title={
              isOnline
                ? 'Network Connected (Tap to simulate offline mode)'
                : 'Offline Mode (Tap to reconnect & sync)'
            }
            aria-label={isOnline ? 'Network Connected' : 'Offline Mode'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-teal-200" /> : <WifiOff className="w-3.5 h-3.5 text-amber-300" />}
          </button>

          {/* Notifications button */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="p-1.5 rounded-full hover:bg-teal-700 transition relative"
            title={t.notifications}
          >
            <Bell className="w-4 h-4 text-teal-100" />
            {unreadNotifs > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Offline Status Ribbon */}
      {(!isOnline || offlineDrafts.length > 0) && (
        <div
          className={`px-3 py-1.5 text-xs flex items-center justify-between border-b transition-colors ${!isOnline
              ? 'bg-amber-500/90 text-amber-950 border-amber-600 font-medium'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
        >
          <div className="flex items-center gap-1.5 text-[11px]">
            {!isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-950 shrink-0" />
                <span>
                  Offline Mode • {offlineDrafts.length} {offlineDrafts.length === 1 ? 'draft' : 'drafts'} saved locally
                </span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {offlineDrafts.length} pending offline {offlineDrafts.length === 1 ? 'draft' : 'drafts'} ready to sync
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {!isOnline ? (
              <button
                onClick={() => {
                  setIsOnline(true);
                  syncOfflineDrafts();
                }}
                className="text-[10px] bg-amber-900 text-amber-100 hover:bg-amber-950 px-2 py-0.5 rounded font-semibold transition active:scale-95 flex items-center gap-1"
              >
                <Wifi className="w-3 h-3" /> Reconnect
              </button>
            ) : (
              <button
                onClick={() => syncOfflineDrafts()}
                disabled={isSyncing}
                className="text-[10px] bg-emerald-700 text-white hover:bg-emerald-800 px-2 py-0.5 rounded font-semibold transition active:scale-95 flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Subtle Toast Notification (Triggers when reconnecting to network & syncing pending drafts) */}
      {syncToast?.visible && (
        <aside
          role="status"
          aria-live="polite"
          className="absolute top-16 left-3 right-3 z-50 transition-all duration-300 transform translate-y-0"
        >
          <div
            className={`rounded-xl p-3 shadow-xl border backdrop-blur-md flex items-start gap-2.5 ${syncToast.type === 'sync-success'
                ? 'bg-slate-900/95 text-white border-emerald-500/50 ring-1 ring-emerald-500/20'
                : 'bg-slate-900/95 text-white border-amber-500/50 ring-1 ring-amber-500/20'
              }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${syncToast.type === 'sync-success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
            >
              {syncToast.type === 'sync-success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-400" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1">
                <p
                  className={`text-xs font-semibold flex items-center gap-1.5 ${syncToast.type === 'sync-success' ? 'text-emerald-300' : 'text-amber-300'
                    }`}
                >
                  <Wifi className="w-3.5 h-3.5" />
                  {syncToast.title}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {syncToast.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">
                {syncToast.message}
              </p>
              {syncToast.type === 'sync-success' && (
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>Backend synchronization confirmed</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSyncToast((prev) => (prev ? { ...prev, visible: false } : null))}
              className="text-slate-400 hover:text-white transition p-1 -mr-1 -mt-1 rounded-md"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* Main Screen Content Area */}
      <main className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'home' && (
          <div className="p-4 space-y-4">
            {/* Citizen Greeting & Trust Banner */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-850 text-white rounded-2xl p-4 shadow-sm border border-teal-600/30">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-200 bg-teal-900/60 px-2 py-0.5 rounded">
                    Digital Public Good
                  </span>
                  <h2 className="text-lg font-bold mt-1.5">
                    {t.reportIssue}
                  </h2>
                  <p className="text-xs text-teal-100 mt-0.5">
                    "Tell us what your community needs."
                  </p>
                </div>
                <button
                  onClick={() => playTTS('नमस्ते। अपने गांव या मोहल्ले की समस्या बताइए।')}
                  className="p-2 bg-teal-600/50 hover:bg-teal-600 rounded-full transition text-teal-100"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Active Location Indicator */}
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-teal-100 bg-teal-900/40 px-2.5 py-1.5 rounded-lg border border-teal-700/50">
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate">{locationName}</span>
              </div>
            </div>

            {/* Quick Primary Actions: Voice, Type, Photo */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => {
                  setInputMode('voice');
                  setIsModalOpen(true);
                }}
                className="flex flex-col items-center justify-center p-3.5 bg-white rounded-xl shadow-xs border border-teal-100 hover:border-teal-400 hover:bg-teal-50/50 transition active:scale-95 group"
              >
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
                  <Mic className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-xs font-semibold text-slate-800 text-center leading-tight">
                  {t.speakToReport}
                </span>
                <span className="text-[10px] text-teal-600 mt-0.5 font-medium">13 Languages</span>
              </button>

              <button
                onClick={() => {
                  setInputMode('text');
                  setIsModalOpen(true);
                }}
                className="flex flex-col items-center justify-center p-3.5 bg-white rounded-xl shadow-xs border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-800 text-center leading-tight">
                  {t.typeToReport}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Text Form</span>
              </button>

              <button
                onClick={() => {
                  setInputMode('photo');
                  setSelectedPhoto(null);
                  setIsModalOpen(true);
                  setTimeout(() => {
                    startCamera('environment');
                  }, 120);
                }}
                className="flex flex-col items-center justify-center p-3.5 bg-white rounded-xl shadow-xs border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center mb-2 shadow-sm">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-800 text-center leading-tight">
                  {t.uploadPhoto}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Geotag Photo</span>
              </button>
            </div>

            {/* Multilingual AI Test & Verification Suite */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-teal-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                  Multilingual AI Classification Test Suite:
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded border border-teal-300">
                  13 Indian Languages + Hinglish
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Tap any test phrase below to verify semantic sanitization and zero-keyword categorization:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { text: 'Hamare gaon mein paani ki problem hai.', label: '💧 Water (Hinglish)', expected: 'WATER' },
                  { text: 'There is a water issue in my village.', label: '💧 Water (English)', expected: 'WATER' },
                  { text: 'हमारे गांव में पानी की समस्या है।', label: '💧 Water (Hindi)', expected: 'WATER' },
                  { text: 'আমাদের গ্রামে পানীয় জলের সমস্যা রয়েছে।', label: '💧 Water (Bengali)', expected: 'WATER' },
                  { text: 'எங்கள் கிராமத்தில் குடிநீர் பிரச்சனை உள்ளது.', label: '💧 Water (Tamil)', expected: 'WATER' },
                  { text: 'Hamare gaon ki road bahut kharab hai.', label: '🛣️ Road (Hinglish)', expected: 'ROAD' },
                  { text: 'Our village road is broken.', label: '🛣️ Road (English)', expected: 'ROAD' },
                  { text: 'Hospital bahut door hai.', label: '🏥 Healthcare (Hinglish)', expected: 'HEALTHCARE' },
                  { text: 'हमारे इलाके में कचरा जमा है।', label: '🧹 Sanitation (Hindi)', expected: 'SANITATION' },
                  { text: 'Bijli baar baar ja rahi hai.', label: '⚡ Electricity (Hinglish)', expected: 'ELECTRICITY' },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputMode('text');
                      setIsModalOpen(true);
                      setInputText(sample.text);
                      processAIAnalysis(sample.text);
                    }}
                    className="text-[10px] font-semibold bg-white hover:bg-teal-100 hover:text-teal-900 text-slate-700 border border-slate-300 px-2 py-1 rounded-md transition shadow-2xs"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Community Pulse Section */}
            <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-700" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {t.communityVoiceCount}
                  </h3>
                </div>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Barmer District
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-2.5">
                People in your area have reported infrastructure needs:
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-2">
                  <div className="text-base font-extrabold text-teal-800">89</div>
                  <div className="text-[10px] font-medium text-teal-700">{t('categories.ROAD')}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <div className="text-base font-extrabold text-blue-800">42</div>
                  <div className="text-[10px] font-medium text-blue-700">{t('categories.WATER')}</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-2">
                  <div className="text-base font-extrabold text-rose-800">35</div>
                  <div className="text-[10px] font-medium text-rose-700">{t('categories.HEALTHCARE')}</div>
                </div>
              </div>
            </div>

            {/* Recent Requests Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {t.myRequests} ({requests.length})
                </h3>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                >
                  {t('common.all')} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {loading ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-teal-600 mb-1" />
                  {t('common.loading')}
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500">{t('request.noRequestsDesc')}</p>
                  <button
                    onClick={() => {
                      setInputMode('voice');
                      setIsModalOpen(true);
                    }}
                    className="mt-3 text-xs bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-800 transition"
                  >
                    {t.reportIssue}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {requests.slice(0, 3).map((req) => {
                    const statusStyle = STATUS_COLORS[req.status] || STATUS_COLORS.SUBMITTED;
                    const catLabel = t(`categories.${req.category}`) || (t.categories && t.categories[req.category]) || req.category;
                    const statusLabel = t(`status.${req.status}`) || (t.status && t.status[req.status]) || req.status;
                    return (
                      <div
                        key={req.id}
                        className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 hover:border-teal-300 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                {req.id}
                              </span>
                              <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                {catLabel}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                              {req.title}
                            </h4>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 italic">
                          "{req.originalText}"
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 min-w-0">
                            <MapPin className={`w-3 h-3 shrink-0 ${req.isLocationBlurred ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="truncate">
                              {req.isLocationBlurred
                                ? `${req.block ? `${req.block}, ` : ''}${req.district}`
                                : (req.village || req.district)}, {req.state}
                            </span>
                            {req.isLocationBlurred && (
                              <span className="text-[9px] bg-indigo-50 text-indigo-700 font-semibold px-1 rounded border border-indigo-200 shrink-0">
                                Privacy Blurred
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-1 shrink-0 ml-2">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trust and Privacy Notice */}
            <div className="bg-slate-100 rounded-xl p-3 text-[11px] text-slate-600 flex items-start gap-2 border border-slate-200">
              <Shield className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Privacy Guarantee:</span>{' '}
                {t.trustNotice}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Requests Tracking */}
        {activeTab === 'requests' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t.myRequests}
              </h2>
              <button
                onClick={fetchRequests}
                className="text-xs text-teal-700 flex items-center gap-1 font-medium hover:underline"
              >
                <RefreshCw className="w-3 h-3" /> {t('common.refresh')}
              </button>
            </div>

            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {req.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[req.status]?.bg || 'bg-slate-100'
                      } ${STATUS_COLORS[req.status]?.text || 'text-slate-700'}`}
                  >
                    {t(`status.${req.status}`) || (t.status && t.status[req.status]) || req.status}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900">{req.title}</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className={`w-3 h-3 shrink-0 ${req.isLocationBlurred ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">
                    {req.isLocationBlurred
                      ? `${req.block ? `${req.block}, ` : ''}${req.district}`
                      : (req.village || req.district)}, {req.state}
                  </span>
                  {req.isLocationBlurred && (
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 font-semibold px-1 rounded border border-indigo-200 shrink-0">
                      {t('location.districtBlockOnly')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                  "{req.originalText}"
                </p>

                {req.analysis && (
                  <div className="bg-teal-50/60 rounded-lg p-2.5 text-[11px] border border-teal-100 space-y-1">
                    <div className="font-semibold text-teal-900 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-700" />
                      {t('aiConfirmation.title')} ({t('aiConfirmation.confidence')} {(req.aiConfidence * 100).toFixed(0)}%):
                    </div>
                    <div className="text-slate-700">
                      <span className="font-medium">{t('request.problemDescription')}:</span> {req.analysis.detectedProblem}
                    </div>
                    <div className="text-slate-700">
                      <span className="font-medium">{t('urgency.title')}:</span> {req.analysis.urgencyReason}
                    </div>
                  </div>
                )}

                {/* Progress Status Timeline */}
                <div className="pt-2">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    {t('dashboard.operationsHealth')}:
                  </div>
                  <div className="space-y-1.5 border-l-2 border-teal-600 pl-3 ml-1 text-[11px]">
                    {req.statusHistory?.map((hist, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white" />
                        <div className="font-bold text-slate-800">
                          {t(`status.${hist.status}`) || (t.status && t.status[hist.status]) || hist.status}
                        </div>
                        <div className="text-slate-600 text-[10px]">{hist.comment}</div>
                        <div className="text-[9px] text-slate-400">
                          By: {hist.updatedBy} • {new Date(hist.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Nearby Issues */}
        {activeTab === 'nearby' && (
          <div className="p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t.nearbyIssues} (Chohtan Block)
            </h2>
            <p className="text-xs text-slate-600">
              Aggregated community development signals within 25 km radius. Identities and exact coordinates are protected.
            </p>

            <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-teal-900">Chohtan-Shivnagar Corridor</span>
                <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                  High Hotspot
                </span>
              </div>
              <p className="text-xs text-slate-700">
                89 citizen submissions reported washed gravel roads impeding emergency ambulance transit to nearest CHC.
              </p>
              <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Affected Population: ~48,500</span>
                <span className="font-semibold text-teal-700">Official Action: Under Review</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Notifications */}
        {activeTab === 'notifications' && (
          <div className="p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t.notifications}
            </h2>
            <div className="bg-white rounded-xl p-3 shadow-xs border border-teal-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900">Official Status Update</span>
                <span className="text-[10px] text-slate-400">Today, 09:00 AM</span>
              </div>
              <p className="text-xs text-slate-700">
                Your report regarding Chohtan link road (REQ-2026-0081) has been marked UNDER_REVIEW by Barmer District Works.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Profile */}
        {activeTab === 'profile' && (
          <div className="p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t.profile}
            </h2>
            <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-lg">
                  RP
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Ramesh Patel</h3>
                  <p className="text-xs text-slate-500">+91 98765 43210 • Shivnagar, Barmer</p>
                  <span className="inline-block mt-1 text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-semibold">
                    Verified Citizen Account
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Preferred Language</span>
                  <span className="font-semibold text-slate-800">{t.appName} (हिन्दी)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">State / District</span>
                  <span className="font-semibold text-slate-800">Rajasthan / Barmer</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Total Submissions</span>
                  <span className="font-semibold text-teal-700">{requests.length} requests</span>
                </div>
              </div>

              {onOpenDashboard && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={onOpenDashboard}
                    className="w-full bg-slate-900 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                  >
                    Open Government Web Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) for reporting */}
      {activeTab === 'home' && (
        <div className="absolute bottom-20 right-4 z-20">
          <button
            onClick={() => {
              setInputMode('voice');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-bold text-xs px-4 py-3 rounded-full shadow-lg border border-teal-500 transition"
          >
            <Mic className="w-4 h-4" />
            <span>{t.reportIssue}</span>
          </button>
        </div>
      )}

      {/* Bottom Mobile Tab Bar */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around z-10 shrink-0">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${activeTab === 'home' ? 'text-teal-700 font-bold' : 'text-slate-500'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">{t('navigation.home')}</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${activeTab === 'requests' ? 'text-teal-700 font-bold' : 'text-slate-500'
            }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">{t.myRequests}</span>
        </button>

        <button
          onClick={() => setActiveTab('nearby')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${activeTab === 'nearby' ? 'text-teal-700 font-bold' : 'text-slate-500'
            }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">{t.nearbyIssues}</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${activeTab === 'profile' ? 'text-teal-700 font-bold' : 'text-slate-500'
            }`}
        >
          <UserIcon className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">{t.profile}</span>
        </button>
      </nav>

      {/* REQUEST CREATION & AI CONFIRMATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-teal-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-300" />
                <h3 className="font-bold text-sm">
                  {showAiConfirmation ? t.confirmSubmission : t.reportIssue}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setShowAiConfirmation(false);
                  setIsRecording(false);
                }}
                className="p-1 rounded-full hover:bg-teal-700 text-teal-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
              {!showAiConfirmation ? (
                <>
                  {/* Mode selector tab */}
                  <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-100 text-xs font-semibold">
                    <button
                      onClick={() => setInputMode('voice')}
                      className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition ${inputMode === 'voice'
                          ? 'bg-white text-teal-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <Mic className="w-3.5 h-3.5" /> {t.speakToReport}
                    </button>
                    <button
                      onClick={() => setInputMode('text')}
                      className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition ${inputMode === 'text'
                          ? 'bg-white text-teal-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <FileText className="w-3.5 h-3.5" /> {t.typeToReport}
                    </button>
                    <button
                      onClick={() => setInputMode('photo')}
                      className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition ${inputMode === 'photo'
                          ? 'bg-white text-teal-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <Camera className="w-3.5 h-3.5" /> {t.uploadPhoto}
                    </button>
                  </div>

                  {/* VOICE MODE INTERFACE */}
                  {inputMode === 'voice' && (
                    <div className="flex flex-col items-center justify-center py-4 space-y-3">
                      <div className="relative">
                        <button
                          onClick={isRecording ? handleStopVoice : handleStartVoice}
                          className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-lg ${isRecording
                              ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                              : 'bg-teal-700 hover:bg-teal-800 text-white'
                            }`}
                        >
                          <Mic className="w-9 h-9" />
                        </button>
                        {isRecording && (
                          <span className="absolute -top-2 -right-2 bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {recordingSeconds}s
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-700 text-center">
                        {isRecording ? t.tapToStop : t.tapToSpeak}
                      </p>

                      {/* Waveform graphic indicator */}
                      {isRecording && (
                        <div className="flex items-center gap-1 h-6">
                          <span className="w-1 bg-teal-600 h-2 animate-bounce" />
                          <span className="w-1 bg-teal-600 h-5 animate-bounce [animation-delay:0.1s]" />
                          <span className="w-1 bg-teal-600 h-6 animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1 bg-teal-600 h-3 animate-bounce [animation-delay:0.3s]" />
                          <span className="w-1 bg-teal-600 h-5 animate-bounce [animation-delay:0.15s]" />
                        </div>
                      )}

                      {/* Voice transcript preview if recorded */}
                      {inputText && (
                        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800">
                          <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>{t('request.sanitizedMeaning')}</span>
                            <button
                              onClick={() => playTTS(inputText)}
                              className="text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                            >
                              <Volume2 className="w-3 h-3" /> {t('voice.listening')}
                            </button>
                          </div>
                          <p className="italic">"{inputText}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TEXT MODE */}
                  {inputMode === 'text' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 block">
                        {t('request.describeProblem')}
                      </label>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t('request.describeProblem')}
                        rows={4}
                        className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* PHOTO / CAMERA MODE */}
                  {inputMode === 'photo' && (
                    <div className="space-y-3">
                      {/* Hidden file input for gallery/camera upload fallback */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {/* 1. Live Camera Active Viewfinder */}
                      {cameraActive && (
                        <div className="relative overflow-hidden rounded-xl bg-slate-950 aspect-video flex items-center justify-center border-2 border-teal-600 shadow-md">
                          <video
                            ref={setVideoRef}
                            autoPlay
                            playsInline
                            muted
                            onCanPlay={(e) => {
                              (e.target as HTMLVideoElement).play().catch(() => { });
                            }}
                            className="w-full h-full object-cover"
                          />

                          {/* Shutter flash animation overlay */}
                          {flashEffect && (
                            <div className="absolute inset-0 bg-white opacity-90 transition-opacity duration-200 pointer-events-none z-30" />
                          )}

                          {/* Viewfinder reticle overlay */}
                          <div className="absolute inset-4 pointer-events-none border border-white/30 rounded-lg flex flex-col justify-between p-2">
                            <div className="flex justify-between items-start">
                              <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-xs font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                                Live Viewfinder
                              </span>
                              <button
                                type="button"
                                onClick={toggleCameraFacing}
                                className="pointer-events-auto bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-xs transition active:scale-95"
                                title="Switch Front/Rear Camera"
                              >
                                <FlipHorizontal className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex justify-between items-end text-[10px] text-white/70 font-mono">
                              <span>GPS: 25.75°N, 71.39°E</span>
                              <span>JANSETU-CAM</span>
                            </div>
                          </div>

                          {/* Top close camera button */}
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="absolute top-2 right-2 z-20 bg-black/70 hover:bg-black text-white p-1.5 rounded-full transition active:scale-95 shadow-sm"
                            title="Close Camera"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Bottom Shutter Capture Bar */}
                          <div className="absolute bottom-2 inset-x-0 flex items-center justify-center z-20">
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="w-14 h-14 rounded-full border-4 border-white bg-white/30 hover:bg-white/50 flex items-center justify-center transition active:scale-90 shadow-xl"
                              title="Capture Photo"
                            >
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-800 shadow-md">
                                <Camera className="w-5 h-5" />
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. Loading Camera State */}
                      {cameraLoading && (
                        <div className="border-2 border-dashed border-teal-300 bg-teal-50/50 rounded-xl p-8 text-center space-y-2">
                          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                          <p className="text-xs font-semibold text-teal-900">Starting device camera...</p>
                          <p className="text-[11px] text-slate-500">Please grant camera permissions when prompted by your browser</p>
                        </div>
                      )}

                      {/* 3. Photo Captured / Selected State */}
                      {selectedPhoto && !cameraActive && !cameraLoading && (
                        <div className="space-y-2">
                          <div className="relative overflow-hidden rounded-xl border-2 border-teal-500 shadow-xs">
                            <img
                              src={selectedPhoto}
                              alt="Captured evidence"
                              className="w-full h-44 object-cover"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-white flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="font-semibold text-[11px]">Photo Captured & Geotagged</span>
                              </div>
                              <span className="text-[10px] text-slate-300 font-mono">25.75°N, 71.39°E</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startCamera('environment')}
                              className="flex-1 py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg border border-teal-200 flex items-center justify-center gap-1.5 transition active:scale-95"
                            >
                              <Camera className="w-3.5 h-3.5 text-teal-700" />
                              Retake Photo
                            </button>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 transition active:scale-95"
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-600" />
                              Choose File
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedPhoto(null)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition active:scale-95"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 4. Default Camera Prompt (No photo captured yet, camera not running) */}
                      {!selectedPhoto && !cameraActive && !cameraLoading && (
                        <div className="space-y-2.5">
                          {cameraError && (
                            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold">Camera Access Note:</p>
                                <p>{cameraError}</p>
                              </div>
                            </div>
                          )}

                          <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50/70 hover:bg-slate-50 transition">
                            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center mx-auto mb-2 shadow-xs">
                              <Camera className="w-6 h-6" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-800">Capture Visual Infrastructure Evidence</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs mx-auto">
                              Take a live photo of damaged roads, water leaks, or civic hazards for AI multimodal analysis.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-3.5">
                              <button
                                type="button"
                                onClick={() => startCamera('environment')}
                                className="w-full sm:w-auto px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition active:scale-95"
                              >
                                <Camera className="w-4 h-4" />
                                Open Live Camera
                              </button>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                              >
                                <Upload className="w-4 h-4 text-slate-500" />
                                Upload from Device
                              </button>
                            </div>
                          </div>

                          {/* Quick Sample Photos for Rapid Multi-modal AI Testing */}
                          <div className="p-2.5 bg-slate-100/80 rounded-xl border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                              Or Test with Verified Infrastructure Samples:
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPhoto('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80');
                                  setInputText('Major pothole and cracked pavement near village main road.');
                                }}
                                className="p-1.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-left transition group"
                              >
                                <span className="text-[11px] font-medium text-slate-800 group-hover:text-teal-900 block truncate">
                                  🛣️ Damaged Road
                                </span>
                                <span className="text-[9px] text-slate-500 block truncate">Potholes & cracks</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPhoto('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80');
                                  setInputText('Drinking water pipeline ruptured with high water loss.');
                                }}
                                className="p-1.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-left transition group"
                              >
                                <span className="text-[11px] font-medium text-slate-800 group-hover:text-teal-900 block truncate">
                                  💧 Water Leakage
                                </span>
                                <span className="text-[9px] text-slate-500 block truncate">Pipe burst</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPhoto('https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80');
                                  setInputText('Exposed electrical wires dangling from broken transformer pole.');
                                }}
                                className="p-1.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-left transition group"
                              >
                                <span className="text-[11px] font-medium text-slate-800 group-hover:text-teal-900 block truncate">
                                  ⚡ Transformer
                                </span>
                                <span className="text-[9px] text-slate-500 block truncate">Hazardous wire</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Problem Description text field */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{t('request.describeProblem')}</label>
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="e.g., Deep pothole after rain, water pipe leaking on main road..."
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Location field with Live GPS & District Selector */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2 min-w-0">
                        <MapPin
                          className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isLocationBlurred ? 'text-indigo-600' : 'text-amber-600'
                            }`}
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 text-[11px] block truncate">
                            {isLocationBlurred
                              ? `${selectedDistrict}, ${selectedState}`
                              : `${selectedVillage || 'Local Area'}, ${selectedDistrict}, ${selectedState}`}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate font-mono">
                            {isLocationBlurred
                              ? t('location.districtBlockOnly')
                              : `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E ${gpsAccuracy ? `(±${gpsAccuracy}m)` : ''
                              }`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {gpsLoading ? (
                          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                            <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-600" />
                            Acquiring GPS
                          </span>
                        ) : gpsAccuracy ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            GPS Locked
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                            Manual Location
                          </span>
                        )}
                      </div>
                    </div>

                    {/* GPS Actions & Edit buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={fetchLiveGps}
                        disabled={gpsLoading}
                        className="flex-1 py-1 px-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-[10px] font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                      >
                        {gpsLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin text-teal-600" />
                        ) : (
                          <LocateFixed className="w-3 h-3 text-teal-600" />
                        )}
                        <span>{gpsLoading ? 'Detecting...' : 'Detect Live GPS'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsLocationSelectorOpen(!isLocationSelectorOpen)}
                        className="py-1 px-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-[10px] font-semibold flex items-center justify-center gap-1 transition active:scale-95"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        <span>{isLocationSelectorOpen ? 'Close Edit' : 'Edit Location'}</span>
                      </button>
                    </div>

                    {/* GPS Error Prompt */}
                    {gpsError && (
                      <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 leading-tight">
                        {gpsError}
                      </p>
                    )}

                    {/* Manual Location Selection Drawer */}
                    {isLocationSelectorOpen && (
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                          Select State & District (India):
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">State</label>
                            <select
                              value={selectedState}
                              onChange={(e) => {
                                const st = e.target.value;
                                setSelectedState(st);
                                const dists = INDIAN_STATES_DISTRICTS[st] || [];
                                const newDist = dists[0] || 'District';
                                setSelectedDistrict(newDist);
                                setLocationName(`${selectedVillage || 'Local Area'}, ${newDist}, ${st}`);
                              }}
                              className="w-full text-[11px] p-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
                            >
                              {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">District</label>
                            <select
                              value={selectedDistrict}
                              onChange={(e) => {
                                const dist = e.target.value;
                                setSelectedDistrict(dist);
                                setLocationName(`${selectedVillage || 'Local Area'}, ${dist}, ${selectedState}`);
                              }}
                              className="w-full text-[11px] p-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
                            >
                              {(INDIAN_STATES_DISTRICTS[selectedState] || []).map((dist) => (
                                <option key={dist} value={dist}>
                                  {dist}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Village / Locality / Ward</label>
                          <input
                            type="text"
                            value={selectedVillage}
                            onChange={(e) => {
                              setSelectedVillage(e.target.value);
                              setLocationName(`${e.target.value || 'Local Area'}, ${selectedDistrict}, ${selectedState}`);
                            }}
                            placeholder="e.g., Shivnagar, Sector 4, Chohtan..."
                            className="w-full text-[11px] p-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Location Precision Privacy Toggle */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <label
                          htmlFor="location-privacy-toggle"
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 cursor-pointer select-none"
                        >
                          <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{t('location.blurPrompt')}</span>
                        </label>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {isLocationBlurred
                            ? t('location.blurActiveDesc')
                            : t('location.blurInactiveDesc')}
                        </p>
                      </div>

                      <button
                        id="location-privacy-toggle"
                        type="button"
                        role="switch"
                        aria-checked={isLocationBlurred}
                        onClick={() => setIsLocationBlurred(!isLocationBlurred)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${isLocationBlurred ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        title={
                          isLocationBlurred
                            ? t('request.switchExact')
                            : t('request.blurPrivacy')
                        }
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isLocationBlurred ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Process Action */}
                  <button
                    disabled={!inputText.trim() || analyzing}
                    onClick={() => processAIAnalysis(inputText)}
                    className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t.processingVoice}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{t('request.processWithAi')}</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* AI UNDERSTOOD CONFIRMATION STEP (Section 21 & 22) */
                (() => {
                  const activeCat = correctedCategory || aiAnalysisResult.primaryCategory || 'OTHER';
                  const meta = CATEGORY_META[activeCat] || CATEGORY_META.OTHER;
                  const localizedCategory = t(`categories.${activeCat}`) || (t.categories && t.categories[activeCat]) || activeCat;
                  const localizedSubcategory = aiAnalysisResult.subcategory
                    ? (t(`subcategories.${aiAnalysisResult.subcategory}`) || (t.subcategories && t.subcategories[aiAnalysisResult.subcategory]) || aiAnalysisResult.subcategory)
                    : t('categories.OTHER');

                  return (
                    <div className="space-y-3">
                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-teal-900 flex items-center gap-1.5 text-xs">
                            <Sparkles className="w-4 h-4 text-teal-600" />
                            {t('aiConfirmation.title')}
                          </span>
                          <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-300">
                            {t('aiConfirmation.confidence')} {Math.round((aiAnalysisResult.categoryConfidence || aiAnalysisResult.aiConfidence || 0.95) * 100)}%
                          </span>
                        </div>

                        {/* Category Highlight with Emoji */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between ${meta.bg}`}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{meta.icon}</span>
                            <div>
                              <div className="font-extrabold text-sm text-slate-900">{localizedCategory}</div>
                              <div className="text-[10px] text-slate-600">
                                {localizedSubcategory}
                              </div>
                            </div>
                          </div>
                          {correctedCategory && (
                            <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-400">
                              {t('aiConfirmation.citizenCorrected')}
                            </span>
                          )}
                        </div>

                        {/* Sanitized Problem Meaning */}
                        <div className="bg-white p-3 rounded-xl border border-teal-100 space-y-1">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {t('aiConfirmation.sanitizedMeaning')}
                          </div>
                          <p className="font-semibold text-slate-800 italic text-xs">
                            "{aiAnalysisResult.sanitizedText || aiAnalysisResult.problem || aiAnalysisResult.detectedProblem}"
                          </p>
                          {aiAnalysisResult.translatedText && aiAnalysisResult.translatedText !== aiAnalysisResult.sanitizedText && (
                            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                              {t('aiConfirmation.translation')} "{aiAnalysisResult.translatedText}"
                            </p>
                          )}
                        </div>

                        {/* Location & Urgency */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-white p-2.5 rounded-lg border border-teal-100 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-slate-500 text-[10px]">{t('location.title')}:</span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${isLocationBlurred
                                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                      : 'bg-teal-100 text-teal-800 border border-teal-200'
                                    }`}
                                >
                                  {isLocationBlurred ? t('location.approximate') : t('location.gpsLocked')}
                                </span>
                              </div>
                              <span className="font-semibold text-slate-800 truncate block">
                                {isLocationBlurred
                                  ? 'Chohtan, Barmer'
                                  : 'Shivnagar, Chohtan, Barmer'}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {isLocationBlurred
                                  ? t('location.districtBlockOnly')
                                  : '25.7521° N, 71.3967° E'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsLocationBlurred(!isLocationBlurred)}
                              className="mt-1.5 pt-1.5 border-t border-slate-100 text-[10px] text-indigo-600 hover:text-indigo-800 font-medium text-left flex items-center gap-1 transition"
                            >
                              <Shield className="w-3 h-3 shrink-0" />
                              <span>{isLocationBlurred ? t('request.switchExact') : t('request.blurPrivacy')}</span>
                            </button>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-teal-100 flex flex-col justify-between">
                            <div>
                              <span className="text-slate-500 text-[10px] block">{t('urgency.level')}</span>
                              <span
                                className={`font-bold ${aiAnalysisResult.urgency === 'CRITICAL'
                                    ? 'text-red-700'
                                    : aiAnalysisResult.urgency === 'HIGH'
                                      ? 'text-amber-700'
                                      : 'text-slate-800'
                                  }`}
                              >
                                {t(`urgency.${aiAnalysisResult.urgency}`) || (t.urgency && t.urgency[aiAnalysisResult.urgency]) || aiAnalysisResult.urgency || t('urgency.MEDIUM')}
                              </span>
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                {t('aiConfirmation.automatedPriority')}
                              </span>
                            </div>
                            <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-[10px] text-teal-700 font-medium">
                              {t('aiConfirmation.janSetuVerification')}
                            </div>
                          </div>
                        </div>

                        {aiAnalysisResult.needsClarification && (
                          <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <div>{t('request.lowConfidenceNotice')}</div>
                          </div>
                        )}

                        {/* Category Correction Selector */}
                        {isEditingCategory && (
                          <div className="bg-slate-100 border border-slate-300 p-3 rounded-xl space-y-2">
                            <div className="text-[11px] font-bold text-slate-800">
                              {t('aiConfirmation.selectCorrectCategory')}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                              {Object.entries(CATEGORY_META).map(([catKey, catVal]) => {
                                const catLabel = t(`categories.${catKey}`) || (t.categories && t.categories[catKey]) || catKey;
                                return (
                                  <button
                                    key={catKey}
                                    type="button"
                                    onClick={() => {
                                      setCorrectedCategory(catKey as RequestCategory);
                                      setIsEditingCategory(false);
                                    }}
                                    className={`p-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 border transition text-left ${activeCat === catKey
                                        ? 'bg-teal-700 text-white border-teal-800'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                      }`}
                                  >
                                    <span>{catVal.icon}</span>
                                    <span className="truncate">{catLabel}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-800 text-center">
                        {t.isThisCorrect}
                      </p>

                      {/* 3 Buttons: Confirm, Edit, Record Again (Section 21) */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingCategory(!isEditingCategory)}
                          className="py-2.5 px-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
                        >
                          {isEditingCategory ? t('common.close') : t('common.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAiConfirmation(false);
                            setInputMode('voice');
                            setInputText('');
                            setHasRecordedAudio(false);
                            setCorrectedCategory(null);
                          }}
                          className="py-2.5 px-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
                        >
                          {t('aiConfirmation.recordAgain')}
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={handleConfirmAndSubmit}
                          className="py-2.5 px-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm text-center"
                        >
                          {submitting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t('aiConfirmation.confirm')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION POPUP */}
      {submissionSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 text-center space-y-3 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {t('success.requestSubmittedSuccessfully')}
            </h3>
            <p className="text-xs text-slate-600">
              {t('request.requestId')}:{' '}
              <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {submissionSuccess.id}
              </span>
            </p>
            {submissionSuccess.isLocationBlurred ? (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-[11px] text-indigo-800 flex items-center justify-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{t('location.blurActiveDesc')}</span>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{t('location.exactGps')} (Shivnagar, Chohtan)</span>
              </div>
            )}
            <button
              onClick={() => {
                setSubmissionSuccess(null);
                setActiveTab('requests');
              }}
              className="w-full bg-teal-700 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-teal-800 transition"
            >
              {t('navigation.myRequests')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
