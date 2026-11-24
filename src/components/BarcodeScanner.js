import { useEffect, useRef, useState } from "react";
import { FiCameraOff, FiLoader } from "react-icons/fi";

const NATIVE_FORMATS = ["upc_a", "upc_e", "ean_13", "ean_8"];

// Live camera view that calls onDetected(code) once when it reads a barcode.
// Uses the browser's built-in BarcodeDetector where it exists (Android Chrome)
// and ZXing everywhere else (iPhone, desktop).
export default function BarcodeScanner({ onDetected, paused = false }) {
  const video = useRef(null);
  const done = useRef(false);
  const callback = useRef(onDetected);
  callback.current = onDetected;
  const [status, setStatus] = useState("starting"); // starting | scanning | error
  const [error, setError] = useState("");

  useEffect(() => {
    if (paused) return;
    done.current = false;
    let stopped = false;
    let stream = null;
    let zxingControls = null;
    let timer = null;

    const found = (code) => {
      if (done.current || stopped) return;
      done.current = true;
      try {
        navigator.vibrate?.(60);
      } catch {}
      callback.current(code);
    };

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser can't use the camera here. Type the number below instead.");
      }
      const constraints = {
        audio: false,
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      };

      let native = null;
      if ("BarcodeDetector" in window) {
        try {
          const supported = await window.BarcodeDetector.getSupportedFormats();
          const formats = NATIVE_FORMATS.filter((f) => supported.includes(f));
          if (formats.length) native = new window.BarcodeDetector({ formats });
        } catch {}
      }

      if (native) {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stopped) return;
        video.current.srcObject = stream;
        await video.current.play().catch(() => {});
        setStatus("scanning");
        const tick = async () => {
          if (stopped || done.current) return;
          try {
            if (video.current?.readyState >= 2) {
              const codes = await native.detect(video.current);
              if (codes[0]?.rawValue) return found(codes[0].rawValue);
            }
          } catch {}
          timer = setTimeout(tick, 150);
        };
        tick();
        return;
      }

      const [{ BrowserMultiFormatOneDReader }, { DecodeHintType, BarcodeFormat }] = await Promise.all([
        import("@zxing/browser"),
        import("@zxing/library"),
      ]);
      const hints = new Map([
        [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]],
        [DecodeHintType.TRY_HARDER, true],
      ]);
      const reader = new BrowserMultiFormatOneDReader(hints, { delayBetweenScanAttempts: 120 });
      if (stopped) return;
      zxingControls = await reader.decodeFromConstraints(constraints, video.current, (result) => {
        if (result) found(result.getText());
      });
      if (stopped) zxingControls.stop();
      else setStatus("scanning");
    }

    start().catch((err) => {
      if (stopped) return;
      setStatus("error");
      setError(
        err?.name === "NotAllowedError"
          ? "Camera access was blocked. Allow the camera for this site in your browser settings, or type the number below."
          : err?.name === "NotFoundError"
            ? "No camera found. Type the number below instead."
            : err?.message || "Couldn't start the camera."
      );
    });

    return () => {
      stopped = true;
      clearTimeout(timer);
      zxingControls?.stop();
      stream?.getTracks().forEach((t) => t.stop());
      const v = video.current;
      if (v?.srcObject) {
        v.srcObject.getTracks?.().forEach((t) => t.stop());
        v.srcObject = null;
      }
    };
  }, [paused]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-900">
      <video ref={video} className="h-full w-full object-cover" playsInline muted autoPlay />
      {status === "scanning" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[38%] w-[78%] rounded-xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]">
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
      {paused && status !== "error" && <div className="absolute inset-0 bg-stone-900/60" />}
    </div>
  );
}
