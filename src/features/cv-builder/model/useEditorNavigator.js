import { useRef } from "react";

export function useEditorNavigator({
  onActivateTarget,
  onExpandSection,
  onExpandItem,
}) {
  const editorScrollRef = useRef(null);
  const editorTargetRefs = useRef({});

  const registerEditorTarget = (targetId, node) => {
    if (!targetId) return;
    if (node) {
      editorTargetRefs.current[targetId] = node;
    } else {
      delete editorTargetRefs.current[targetId];
    }
  };

  const focusEditorTarget = (targetId) => {
    if (targetId?.startsWith("section:")) {
      onExpandSection(targetId.slice("section:".length));
    }

    if (targetId?.startsWith("item:")) {
      onExpandItem(targetId.slice("item:".length));
    }

    const focusNode = () => {
      const node = editorTargetRefs.current[targetId];
      if (!node) return;

      onActivateTarget(targetId);

      if (editorScrollRef.current) {
        const container = editorScrollRef.current;
        const containerBox = container.getBoundingClientRect();
        const nodeBox = node.getBoundingClientRect();
        const nextTop = Math.max(
          container.scrollTop + (nodeBox.top - containerBox.top) - 24,
          0
        );
        container.scrollTo({ top: nextTop, behavior: "smooth" });
        return;
      }

      node.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(focusNode);
    });
  };

  return {
    editorScrollRef,
    registerEditorTarget,
    focusEditorTarget,
  };
}
