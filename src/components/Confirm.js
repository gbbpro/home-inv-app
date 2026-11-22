import { useCallback, useRef, useState } from "react";
import Modal from "./Modal";

// const [confirm, confirmDialog] = useConfirm();
// if (await confirm({ title, message, action: "Delete", danger: true })) { ... }
export function useConfirm() {
  const [state, setState] = useState(null);
  const resolver = useRef();

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setState(opts);
      }),
    []
  );

  const close = (result) => {
    resolver.current?.(result);
    setState(null);
  };

  const dialog = (
    <Modal
      open={!!state}
      onClose={() => close(false)}
      title={state?.title || "Are you sure?"}
      size="sm"
      footer={
        <>
          <button className="btn-secondary flex-1" onClick={() => close(false)}>
            Cancel
          </button>
          <button className={`${state?.danger ? "btn-danger" : "btn-primary"} flex-1`} onClick={() => close(true)}>
            {state?.action || "OK"}
          </button>
        </>
      }
    >
      {state?.message && <p className="text-[15px] text-stone-600">{state.message}</p>}
    </Modal>
  );

  return [confirm, dialog];
}
