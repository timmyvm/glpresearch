// Archival and open-licence pictures used on the site, with their credits (shown in the footer
// and on the About page). Lab photography and product vials were generated for GLP Research.

export type PictureCredit = { src: string; title: string; by: string; licence: string; page: string };

export const ARCHIVE: Record<"intestines" | "pancreas" | "gila" | "islets" | "heloderma" | "heart" | "laboratory", PictureCredit> = {
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
  heloderma: {
    src: "/images/archive/heloderma-print.webp",
    title: "Heloderma horridum, hand-coloured print, Iconographia Zoologica",
    by: "Special Collections, University of Amsterdam",
    licence: "Public domain",
    page: "https://commons.wikimedia.org/wiki/File:Heloderma_horridum_-_1700-1880_-_Print_-_Iconographia_Zoologica_-_Special_Collections_University_of_Amsterdam_-_UBA01_IZ12500003.tif",
  },
  heart: {
    src: "/images/archive/heart-kirtland-1806.webp",
    title: "Two lateral views of the human heart, coloured engraving, 1806",
    by: "George Kirtland",
    licence: "Public domain",
    page: "https://commons.wikimedia.org/wiki/File:Two_lateral_views_of_the_human_heart._Coloured_engraving_by_G._Kirtland,_1806.jpg",
  },
  laboratory: {
    src: "/images/archive/chymie-laboratory.webp",
    title: "Chymie: a chemical laboratory and table of affinities, engraving",
    by: "Wellcome Collection",
    licence: "CC BY 4.0",
    page: "https://commons.wikimedia.org/w/index.php?curid=35864312",
  },
};

/** What each generated lab photograph shows, for captions. */
export const LAB_PICTURES: Record<string, string> = {
  "/images/lab/stopwatch.webp": "A laboratory stopwatch beside a vial of freeze-dried peptide",
  "/images/lab/journals.webp": "Bound journals and printed trial reports under a desk lamp",
  "/images/lab/coa-report.webp": "A gloved hand marking the peak on a printed HPLC report",
  "/images/lab/cryo-box.webp": "A box of vials lifted out of a −20 °C freezer",
  "/images/lab/autosampler.webp": "A vial going into an HPLC autosampler tray",
  "/images/lab/freezer-rack.webp": "Racks of vials on frosted freezer shelves",
  "/images/lab/sealing.webp": "Crimping an aluminium seal onto a vial",
  "/images/lab/packing.webp": "Vials packed in foam with a cold pack and a packing slip",
  "/images/lab/vial-cake.webp": "A freeze-dried peptide cake in a 3 mL vial",
  "/images/lab/checking-vial.webp": "Checking the freeze-dried cake against window light",
  "/images/lab/notebook.webp": "A lab notebook beside a rack of vials and a printed chromatogram",
  "/images/lab/lab-night.webp": "The lab at night: HPLC, monitor and freezer",
};

/** A caption for any picture on the site: the archival credit, or what a lab photograph shows. */
export function pictureCaption(src: string | null | undefined) {
  if (!src) return null;
  const archival = Object.values(ARCHIVE).find((c) => c.src === src);
  if (archival) return `${archival.title}. ${archival.by}, ${archival.licence}.`;
  return LAB_PICTURES[src] ?? null;
}
