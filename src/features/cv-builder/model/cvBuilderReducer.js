import { applySeedDataToCv, createBlankCv } from "../../../utils/cvData.js";
import { buildSectionFromTemplate } from "../../../utils/sections.js";

export const createCvBuilderState = (initialCv) => ({
  cv: initialCv,
  saveLabel: "Save",
  exportLabel: "Export PDF",
  activeInspectorTarget: "",
  collapsedSections: {},
  collapsedItems: {},
  insertMenuIndex: null,
});

export function cvBuilderReducer(state, action) {
  switch (action.type) {
    case "set-cv": {
      const nextCv = typeof action.updater === "function"
        ? action.updater(state.cv)
        : action.value;
      return { ...state, cv: nextCv };
    }

    case "update-basics":
      return {
        ...state,
        cv: {
          ...state.cv,
          basics: {
            ...state.cv.basics,
            [action.key]: action.value,
          },
        },
      };

    case "update-section":
      return {
        ...state,
        cv: {
          ...state.cv,
          sections: state.cv.sections.map((section) =>
            section.id === action.sectionId ? action.updater(section) : section
          ),
        },
      };

    case "update-item":
      return {
        ...state,
        cv: {
          ...state.cv,
          sections: state.cv.sections.map((section) =>
            section.id === action.sectionId
              ? {
                  ...section,
                  items: (section.items || []).map((item) =>
                    item.id === action.itemId ? action.updater(item) : item
                  ),
                }
              : section
          ),
        },
      };

    case "move-section": {
      const index = state.cv.sections.findIndex((section) => section.id === action.sectionId);
      const target = index + action.delta;
      if (index < 0 || target < 0 || target >= state.cv.sections.length) return state;

      const sections = [...state.cv.sections];
      const [section] = sections.splice(index, 1);
      sections.splice(target, 0, section);

      return {
        ...state,
        cv: { ...state.cv, sections },
      };
    }

    case "move-item":
      return {
        ...state,
        cv: {
          ...state.cv,
          sections: state.cv.sections.map((section) => {
            if (section.id !== action.sectionId) return section;

            const index = (section.items || []).findIndex((item) => item.id === action.itemId);
            const target = index + action.delta;
            if (index < 0 || target < 0 || target >= section.items.length) return section;

            const items = [...section.items];
            const [item] = items.splice(index, 1);
            items.splice(target, 0, item);
            return { ...section, items };
          }),
        },
      };

    case "insert-section-at": {
      const sections = [...(state.cv.sections || [])];
      sections.splice(action.index, 0, buildSectionFromTemplate(action.templateKey));
      return {
        ...state,
        cv: { ...state.cv, sections },
        insertMenuIndex: null,
      };
    }

    case "set-save-label":
      return { ...state, saveLabel: action.value };

    case "set-export-label":
      return { ...state, exportLabel: action.value };

    case "set-active-inspector-target":
      return { ...state, activeInspectorTarget: action.value };

    case "toggle-section-collapsed":
      return {
        ...state,
        collapsedSections: {
          ...state.collapsedSections,
          [action.sectionId]: !state.collapsedSections[action.sectionId],
        },
      };

    case "expand-section":
      return {
        ...state,
        collapsedSections: {
          ...state.collapsedSections,
          [action.sectionId]: false,
        },
      };

    case "toggle-item-collapsed":
      return {
        ...state,
        collapsedItems: {
          ...state.collapsedItems,
          [action.itemId]: !state.collapsedItems[action.itemId],
        },
      };

    case "expand-item":
      return {
        ...state,
        collapsedItems: {
          ...state.collapsedItems,
          [action.itemId]: false,
        },
      };

    case "set-insert-menu-index":
      return { ...state, insertMenuIndex: action.value };

    case "reset-cv":
      return {
        ...state,
        cv: applySeedDataToCv(state.cv || createBlankCv()),
      };

    default:
      return state;
  }
}
