import { BookPage, TextStyle } from "../types";

export const getDefaultTextStyle = (isTitle: boolean): TextStyle => ({
  fontFamily: "Inter, sans-serif",
  color: isTitle ? "#ffffff" : "#dddddd",
  fontSize: isTitle ? 28 : 16,
  textAlign: isTitle ? "center" : "left",
  fontWeight: isTitle ? "bold" : "normal",
  fontStyle: "normal",
  textDecoration: "none",
  isGradient: false
});

/**
 * Creates a safely structured BookPage pre-populated with reliable fallback styles
 * to avoid rendering engine crashes when properties fall out of bounds.
 */
export const createPage = (overrides: Partial<BookPage> & { id: string, type: BookPage['type'], title: string, content: string }): BookPage => {
  return {
    imageUrl: undefined,
    titleStyle: getDefaultTextStyle(true),
    contentStyle: getDefaultTextStyle(false),
    titlePosition: { x: 0, y: 0, w: 100, h: 20 },
    contentPosition: { x: 0, y: 20, w: 100, h: 80 },
    extraElements: [],
    isFreeLayout: false,
    layoutPreset: 'center',
    overlayBlur: 4,
    overlayOpacity: 0.5,
    isFactChecked: false,
    ...overrides,
  };
};
