export function getAuthorTheme(author: any) {

  const themeConfig =
    author.pro === true
      ? author.theme
      : null

  return {
    bg:
      themeConfig?.bg ??
      "#151518",

    surface:
      themeConfig?.surface ??
      "#505061",

    primary:
      themeConfig?.primary ??
      "#5d83d3",

    text:
      themeConfig?.text ??
      "#ffffff",

    muted:
      themeConfig?.muted ??
      "#a1a1aa",

    border:
      themeConfig?.border ??
      "#818198",
  }
}