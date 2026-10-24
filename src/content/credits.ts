// Archival and open-licence pictures used on the site, with their credits (shown in the footer
// and on the About page). Lab photography and product vials were generated for GLP Research.

export type PictureCredit = { src: string; title: string; by: string; licence: string; page: string };

export const ARCHIVE: Record<"intestines" | "pancreas" | "gila" | "islets", PictureCredit> = {
  intestines: {
    src: "/images/archive/intestines-1686.webp",
    title: "The intestines, engraving, 1686",
    by: "Wellcome Collection",
    licence: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:The_intestines._Engraving,_1686._Wellcome_V0007784EC.jpg",
  },
  pancreas: {
    src: "/images/archive/pancreas-wirsung-1642.webp",
    title: "Drawing of the pancreas, J. G. Wirsung, 1642",
    by: "Wellcome Collection",
    licence: "CC BY 4.0",
    page: "https://commons.wikimedia.org/w/index.php?curid=35865145",
  },
  gila: {
    src: "/images/archive/gila-monster.webp",
    title: "Reticulate Gila monster, Patagonia Lake, Arizona",
    by: "Alan Schmierer",
    licence: "CC0",
    page: "https://commons.wikimedia.org/w/index.php?curid=57044520",
  },
  islets: {
    src: "/images/archive/islets.webp",
    title: "Islets of Langerhans in the human pancreas",
    by: "Berkshire Community College Bioscience Image Library",
    licence: "CC0",
    page: "https://commons.wikimedia.org/w/index.php?curid=81008661",
  },
};
