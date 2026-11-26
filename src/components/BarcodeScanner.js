import { useEffect, useRef, useState } from "react";
import { FiCameraOff, FiLoader } from "react-icons/fi";

const NATIVE_FORMATS = ["upc_a", "upc_e", "ean_13", "ean_8"];

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

// Returns an async function (canvas) => code | null.
// Android Chrome has a fast built-in BarcodeDetector. Everywhere else
// (including iPhone, where it's unreliable) we use ZXing.
async function makeDecoder() {
  if (!isIOS() && "BarcodeDetector" in window) {
    try {
      const supported = await window.BarcodeDetector.getSupportedFormats();
      const formats = NATIVE_FORMATS.filter((f) => supported.includes(f));
      if (formats.length) {
        const detector = new window.BarcodeDetector({ formats });
        return async (canvas) => {
          const codes = await detector.detect(canvas);
          return codes[0]?.rawValue || null;
        };
      }
    } catch {}
  }
  const [{ BrowserMultiFormatOneDReader }, { DecodeHintType, BarcodeFormat }] = await Promise.all([
    import("@zxing/browser"),
    import("@zxing/library"),
  ]);
  const hints = new Map([
    [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]],
    [DecodeHintType.TRY_HARDER, true],
  ]);
  const reader = new BrowserMultiFormatOneDReader(hints);
  return async (canvas) => {
    try {
      return reader.decodeFromCanvas(canvas).getText();
    } catch {
      return null; // no barcode in this frame
    }
  };
}

// Copy part of a video frame or image into a canvas, scaled down for speed.
function grab(source, width, height, crop, canvas) {
  const sx = width * crop.x;
  const sy = height * crop.y;
  const sw = width * crop.w;
  const sh = height * crop.h;
  const scale = Math.min(1, 1000 / sw);
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  canvas.getContext("2d", { willReadFrequently: true }).drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

// Reads a barcode from a photo file. Returns the code or null.
export async function decodePhoto(file) {
  const decode = await makeDecoder();
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = URL.createObjectURL(file);
  });
  try {
    const canvas = document.createElement("canvas");
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    // Whole photo first, then the middle band where people usually aim.
    for (const crop of [{ x: 0, y: 0, w: 1, h: 1 }, { x: 0.05, y: 0.25, w: 0.9, h: 0.5 }]) {
      const code = await decode(grab(img, w, h, crop, canvas));
      if (code) return code;
    }
    return null;
  } finally {
    URL.revokeObjectURL(img.src);
  }
}

// Live camera view that calls onDetected(code) once when it reads a barcode.
// The app owns the camera stream and decodes still frames from it, so no
// library touches the <video> element (that's what went black on iPhone).
export default function BarcodeScanner({ onDetected }) {
  const video = useRef(null);
  const callback = useRef(onDetected);
  callback.current = onDetected;
  const [status, setStatus] = useState("starting"); // starting | scanning | error
  const [error, setError] = useState("");

  useEffect(() => {
    let stopped = false;
    let done = false;
    let stream = null;
    let timer = null;
    const canvas = document.createElement("canvas");

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser can't use the camera here. Take a photo or type the number below instead.");
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (stopped) return;

      const v = video.current;
      v.muted = true;
      v.setAttribute("playsinline", "");
      v.setAttribute("muted", "");
      v.srcObject = stream;
      await v.play().catch(() => {});
      if (stopped) return;
      setStatus("scanning");

      const decode = await makeDecoder();
      const tick = async () => {
        if (stopped || done) return;
        try {
          if (v.readyState >= 2 && v.videoWidth) {
            // The aiming box: middle 80% wide, 40% tall.
            const code = await decode(grab(v, v.videoWidth, v.videoHeight, { x: 0.1, y: 0.3, w: 0.8, h: 0.4 }, canvas));
            if (code && !stopped && !done) {
              done = true;
              try {
                navigator.vibrate?.(60);
              } catch {}
              callback.current(code);
              return;
            }
          }
        } catch {}
        timer = setTimeout(tick, 120);
      };
      tick();
    }

    start().catch((err) => {
      if (stopped) return;
      setStatus("error");
      setError(
        err?.name === "NotAllowedError"
          ? "Camera access is blocked. Allow the camera for this site (on iPhone: Settings › Safari › Camera), or take a photo instead."
          : err?.name === "NotFoundError"
            ? "No camera found. Take a photo or type the number below instead."
            : err?.message || "Couldn't start the camera."
      );
    });

    return () => {
      stopped = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
      if (video.current) video.current.srcObject = null;
    };
  }, []);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black">
      <video ref={video} className="h-full w-full object-cover" playsInline muted autoPlay />
      {status === "scanning" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[40%] w-[80%] rounded-xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-x-3 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-brand-500" />
          </div>
        </div>
      )}
      {status === "starting" && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white/80">
          <FiLoader className="animate-spin" /> Starting camera…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-sm text-white/90">
          <FiCameraOff size={26} className="text-white/60" />
          {error}
        </div>
      )}
    </div>
  );
}

