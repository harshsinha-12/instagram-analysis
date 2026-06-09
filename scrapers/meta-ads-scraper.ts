export type MetaAdCreative = {
  brandName: string;
  copy: string;
  cta?: string;
  format?: string;
  startedAt?: string;
  platforms: string[];
};

export async function fetchMetaAdsLibraryCreatives(_brandNames: string[]): Promise<MetaAdCreative[]> {
  throw new Error("Meta Ads Library analyzer is a phase-two integration stub.");
}
