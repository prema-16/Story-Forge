import { logger } from '../config/logger';

export type MarketplaceCategory =
  | 'template'
  | 'agent_pack'
  | 'lut'
  | 'transition'
  | 'voice_pack'
  | 'music_pack'
  | 'plugin';

export interface MarketplaceItem {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  priceInr: number;
  rating: number;
  downloadsCount: number;
  salesCount: number;
  previewUrl?: string;
  createdAt: string;
}

export class MarketplaceService {
  private items = new Map<string, MarketplaceItem>();

  constructor() {
    this.publishItem({
      id: 'mkt_101',
      creatorId: 'user_cinema_master',
      creatorName: 'Alex Rivers (Cinematographer)',
      title: 'Hollywood Sci-Fi 4K LUT Pack',
      description: '12 professional color grading LUTs tuned for sci-fi and Marvel-style high contrast video clips.',
      category: 'lut',
      priceInr: 499,
      rating: 4.9,
      downloadsCount: 1420,
      salesCount: 1420,
      createdAt: new Date().toISOString(),
    });

    this.publishItem({
      id: 'mkt_102',
      creatorId: 'user_viral_shorts',
      creatorName: 'Sarah K. (Shorts Studio)',
      title: '30-Sec TikTok Virality Agent Swarm',
      description: 'Custom 3-agent prompt swarm optimized for high retention 9:16 vertical shorts.',
      category: 'agent_pack',
      priceInr: 799,
      rating: 5.0,
      downloadsCount: 2890,
      salesCount: 2890,
      createdAt: new Date().toISOString(),
    });

    this.publishItem({
      id: 'mkt_103',
      creatorId: 'user_cyber_vfx',
      creatorName: 'Cyberpunk Visual FX Lab',
      title: 'Cyberpunk Neon Visual Transitions Pack',
      description: 'Futuristic Cyberpunk neon transition presets for high energy shortform content.',
      category: 'transition',
      priceInr: 399,
      rating: 4.8,
      downloadsCount: 940,
      salesCount: 940,
      createdAt: new Date().toISOString(),
    });
  }

  publishItem(item: MarketplaceItem): MarketplaceItem {
    if (item.salesCount === undefined) item.salesCount = item.downloadsCount || 0;
    this.items.set(item.id, item);
    logger.info(`[MarketplaceService] Published item '${item.title}' by ${item.creatorName}`);
    return item;
  }

  listItems(category?: MarketplaceCategory): MarketplaceItem[] {
    const all = Array.from(this.items.values());
    if (category) {
      return all.filter((i) => i.category === category);
    }
    return all;
  }

  listAssets(query?: { type?: string; tag?: string }): MarketplaceItem[] {
    return this.listItems(query?.type as MarketplaceCategory);
  }

  searchAssets(queryStr: string): MarketplaceItem[] {
    const term = queryStr.toLowerCase();
    return Array.from(this.items.values()).filter(
      (i) => i.title.toLowerCase().includes(term) || i.description.toLowerCase().includes(term)
    );
  }

  purchaseAsset(assetId: string, buyerUserId = 'user_default'): { success: boolean; asset?: MarketplaceItem; item?: MarketplaceItem; error?: string } {
    const item = this.items.get(assetId);
    if (!item) {
      return { success: false, error: 'Asset not found' };
    }

    item.downloadsCount += 1;
    item.salesCount = (item.salesCount || 0) + 1;
    this.items.set(assetId, item);
    logger.info(`[MarketplaceService] User ${buyerUserId} purchased asset '${item.title}'`);
    return { success: true, asset: item, item };
  }

  calculateCreatorPayout(itemPriceInr: number): { creatorShareInr: number; platformShareInr: number } {
    const creatorShare = Math.round(itemPriceInr * 0.70); // 70% Creator Revenue Share
    const platformShare = itemPriceInr - creatorShare;
    return { creatorShareInr: creatorShare, platformShareInr: platformShare };
  }
}

export const marketplaceService = new MarketplaceService();
